package ir.yasinyar.app;

import android.app.Activity;
import android.os.Bundle;
import android.content.Intent;
import android.graphics.Bitmap;
import android.net.Uri;
import android.provider.MediaStore;
import android.util.Base64;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.ValueCallback;
import android.webkit.JavascriptInterface;
import android.speech.tts.TextToSpeech;
import android.speech.tts.UtteranceProgressListener;
import java.io.ByteArrayOutputStream;
import java.util.ArrayList;
import java.util.Locale;
import java.util.UUID;

public class MainActivity extends Activity {
    private ValueCallback<Uri[]> filePathCallback;
    private WebView webView;
    private static final int FILE_CHOOSER_REQUEST = 1001;
    private static final int CAMERA_REQUEST = 1002;
    private TextToSpeech textToSpeech;
    private boolean ttsReady = false;
    private boolean ttsPaused = false;
    private float speechRate = 0.92f;
    private ArrayList<String> speechParts = new ArrayList<>();
    private int speechIndex = 0;

    private void sendVoiceEvent(String event, String message) {
        if (webView == null) return;
        String safe = message == null ? "" : message.replace("\\", "\\\\").replace("'", "\\'");
        runOnUiThread(() -> webView.evaluateJavascript(
            "window.onYasinVoiceEvent && window.onYasinVoiceEvent('" + event + "','" + safe + "')", null));
    }

    private void speakNextPart() {
        if (!ttsReady || ttsPaused) return;
        if (speechIndex >= speechParts.size()) {
            sendVoiceEvent("done", "خواندن متن تمام شد.");
            return;
        }
        String part = speechParts.get(speechIndex);
        String id = "yasinyar-" + UUID.randomUUID().toString();
        int result = textToSpeech.speak(part, TextToSpeech.QUEUE_FLUSH, null, id);
        if (result == TextToSpeech.ERROR) sendVoiceEvent("error", "پخش صدا انجام نشد.");
    }

    private class VoiceBridge {
        @JavascriptInterface
        public void speak(String text) {
            runOnUiThread(() -> {
                if (!ttsReady) {
                    sendVoiceEvent("error", "موتور گفتار هنوز آماده نیست.");
                    return;
                }
                speechParts.clear();
                if (text != null) {
                    String normalized = text.trim().replaceAll("\\s+", " ");
                    for (String part : normalized.split("(?<=[.!?؟؛])\\s+")) {
                        if (!part.trim().isEmpty()) speechParts.add(part.trim());
                    }
                }
                if (speechParts.isEmpty()) {
                    sendVoiceEvent("error", "متنی برای خواندن پیدا نشد.");
                    return;
                }
                speechIndex = 0;
                ttsPaused = false;
                speakNextPart();
                sendVoiceEvent("playing", "معلم در حال خواندن است.");
            });
        }

        @JavascriptInterface
        public void pause() {
            runOnUiThread(() -> {
                if (textToSpeech != null && textToSpeech.isSpeaking()) {
                    ttsPaused = true;
                    textToSpeech.stop();
                    sendVoiceEvent("paused", "خواندن مکث شد.");
                }
            });
        }

        @JavascriptInterface
        public void resume() {
            runOnUiThread(() -> {
                if (ttsReady && ttsPaused) {
                    ttsPaused = false;
                    speakNextPart();
                    sendVoiceEvent("playing", "خواندن ادامه پیدا کرد.");
                }
            });
        }

        @JavascriptInterface
        public void stop() {
            runOnUiThread(() -> {
                if (textToSpeech != null) textToSpeech.stop();
                ttsPaused = false;
                speechParts.clear();
                speechIndex = 0;
                sendVoiceEvent("stopped", "پخش متوقف شد.");
            });
        }

        @JavascriptInterface
        public void setRate(float rate) {
            runOnUiThread(() -> {
                speechRate = Math.max(0.65f, Math.min(1.25f, rate));
                if (textToSpeech != null && ttsReady) textToSpeech.setSpeechRate(speechRate);
            });
        }

        @JavascriptInterface
        public boolean isReady() { return ttsReady; }
    }

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        webView = new WebView(this);
        webView.setWebViewClient(new WebViewClient());
        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onShowFileChooser(WebView view, ValueCallback<Uri[]> callback, FileChooserParams params) {
                if (filePathCallback != null) filePathCallback.onReceiveValue(null);
                filePathCallback = callback;
                if (params.isCaptureEnabled()) {
                    Intent camera = new Intent(MediaStore.ACTION_IMAGE_CAPTURE);
                    if (camera.resolveActivity(getPackageManager()) != null) {
                        startActivityForResult(camera, CAMERA_REQUEST);
                        return true;
                    }
                }
                Intent picker = new Intent(Intent.ACTION_GET_CONTENT);
                picker.addCategory(Intent.CATEGORY_OPENABLE);
                picker.setType("image/*");
                startActivityForResult(Intent.createChooser(picker, "انتخاب عکس سؤال"), FILE_CHOOSER_REQUEST);
                return true;
            }
        });
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setAllowFileAccess(true);
        webView.addJavascriptInterface(new VoiceBridge(), "YasinVoice");
        textToSpeech = new TextToSpeech(this, status -> {
            if (status == TextToSpeech.SUCCESS) {
                int language = textToSpeech.setLanguage(new Locale("fa", "IR"));
                ttsReady = language != TextToSpeech.LANG_MISSING_DATA &&
                           language != TextToSpeech.LANG_NOT_SUPPORTED;
                if (ttsReady) {
                    textToSpeech.setSpeechRate(speechRate);
                    textToSpeech.setOnUtteranceProgressListener(new UtteranceProgressListener() {
                        @Override public void onStart(String id) {}
                        @Override public void onDone(String id) {
                            runOnUiThread(() -> {
                                if (!ttsPaused && speechIndex < speechParts.size()) {
                                    speechIndex++;
                                    speakNextPart();
                                }
                            });
                        }
                        @Override public void onError(String id) {
                            sendVoiceEvent("error", "خطا در خواندن متن.");
                        }
                    });
                    sendVoiceEvent("ready", "صدای فارسی آماده است.");
                } else {
                    sendVoiceEvent("unavailable", "صدای فارسی روی گوشی نصب نیست؛ باید صدای فارسی را در تنظیمات تبدیل متن به گفتار اندروید نصب کنی.");
                }
            } else {
                sendVoiceEvent("unavailable", "موتور تبدیل متن به گفتار گوشی در دسترس نیست.");
            }
        });
        webView.loadUrl("file:///android_asset/index.html");
        setContentView(webView);
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == CAMERA_REQUEST) {
            if (resultCode == RESULT_OK && data != null && data.getExtras() != null) {
                Object value = data.getExtras().get("data");
                if (value instanceof Bitmap) {
                    ByteArrayOutputStream stream = new ByteArrayOutputStream();
                    ((Bitmap) value).compress(Bitmap.CompressFormat.JPEG, 92, stream);
                    String encoded = Base64.encodeToString(stream.toByteArray(), Base64.NO_WRAP);
                    webView.evaluateJavascript("window.receiveCameraPhoto('" + encoded + "')", null);
                }
            }
            if (filePathCallback != null) {
                filePathCallback.onReceiveValue(null);
                filePathCallback = null;
            }
        } else if (requestCode == FILE_CHOOSER_REQUEST && filePathCallback != null) {
            Uri[] results = null;
            if (resultCode == RESULT_OK && data != null && data.getData() != null) results = new Uri[]{data.getData()};
            filePathCallback.onReceiveValue(results);
            filePathCallback = null;
        }
    }

    @Override
    protected void onDestroy() {
        if (textToSpeech != null) {
            textToSpeech.stop();
            textToSpeech.shutdown();
        }
        if (webView != null) webView.destroy();
        super.onDestroy();
    }
}
