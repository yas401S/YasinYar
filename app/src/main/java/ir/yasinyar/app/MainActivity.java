package ir.yasinyar.app;

import android.app.Activity;
import android.os.Bundle;
import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Matrix;
import android.graphics.Rect;
import android.content.ClipData;
import android.webkit.MimeTypeMap;
import androidx.core.content.FileProvider;
import androidx.exifinterface.media.ExifInterface;
import java.io.File;
import java.io.FileInputStream;
import java.io.InputStream;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import android.net.Uri;
import android.provider.MediaStore;
import android.util.Base64;
import android.webkit.WebChromeClient;
import android.webkit.ConsoleMessage;
import android.util.Log;
import android.widget.Toast;
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
    private Uri cameraOutputUri;
    private File cameraOutputFile;
    private final ExecutorService cameraExecutor = Executors.newSingleThreadExecutor();
    private TextToSpeech textToSpeech;
    private boolean ttsReady = false;
    private boolean ttsPaused = false;
    private float speechRate = 0.92f;
    private ArrayList<String> speechParts = new ArrayList<>();
    private int speechIndex = 0;

    private boolean openExternalPage(String url) {
        if (url == null) return false;
        Uri uri = Uri.parse(url);
        String scheme = uri.getScheme();
        if (!"http".equalsIgnoreCase(scheme) && !"https".equalsIgnoreCase(scheme)) return false;
        try {
            Intent intent = new Intent(Intent.ACTION_VIEW, uri);
            startActivity(intent);
            return true;
        } catch (Exception e) {
            Log.e("YasinYar-WebView", "Could not open external URL: " + url, e);
            return true;
        }
    }

    private class ExternalLinkBridge {
        @JavascriptInterface
        public void open(String rawUrl) {
            if (rawUrl == null) return;
            Uri uri = Uri.parse(rawUrl);
            String scheme = uri.getScheme();
            if (!"http".equalsIgnoreCase(scheme) && !"https".equalsIgnoreCase(scheme)) return;
            runOnUiThread(() -> {
                try {
                    startActivity(new Intent(Intent.ACTION_VIEW, uri));
                } catch (Exception e) {
                    Log.e("YasinYar-WebView", "No app can open URL: " + rawUrl, e);
                    Toast.makeText(MainActivity.this, "برای باز کردن PDF مرورگر یا برنامه نمایش PDF در دسترس نیست.", Toast.LENGTH_LONG).show();
                }
            });
        }
    }

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
        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                return openExternalPage(url);
            }

            @Override
            public boolean shouldOverrideUrlLoading(WebView view, android.webkit.WebResourceRequest request) {
                return openExternalPage(request.getUrl().toString());
            }
        });
        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onConsoleMessage(ConsoleMessage message) {
                Log.e("YasinYar-WebView", message.message() + " (" +
                    message.sourceId() + ":" + message.lineNumber() + ")");
                return true;
            }

            @Override
            public boolean onShowFileChooser(WebView view, ValueCallback<Uri[]> callback, FileChooserParams params) {
                if (filePathCallback != null) filePathCallback.onReceiveValue(null);
                filePathCallback = callback;
                if (params.isCaptureEnabled()) {
                    try {
                        Intent camera = new Intent(MainActivity.this, CameraCaptureActivity.class);
                        startActivityForResult(camera, CAMERA_REQUEST);
                        return true;
                    } catch (Exception e) {
                        Log.e("YasinYar-Camera", "Could not launch in-app CameraX", e);
                        Toast.makeText(MainActivity.this, "باز کردن دوربین ناموفق بود: " + e.getMessage(), Toast.LENGTH_LONG).show();
                        if (filePathCallback != null) {
                            filePathCallback.onReceiveValue(null);
                            filePathCallback = null;
                        }
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
        webView.addJavascriptInterface(new ExternalLinkBridge(), "YasinExternal");
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
            String path = data != null ? data.getStringExtra("camera_file_path") : null;
            File capturedFile = path != null ? new File(path) : null;
            if (resultCode == RESULT_OK && capturedFile != null && capturedFile.exists() && capturedFile.length() > 0) {
                cameraExecutor.execute(() -> processFullResolutionPhoto(capturedFile));
            } else {
                Toast.makeText(this, "عکسی ثبت نشد؛ دوباره امتحان کن.", Toast.LENGTH_SHORT).show();
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

    private void processFullResolutionPhoto(File file) {
        Bitmap bitmap = null;
        try {
            BitmapFactory.Options bounds = new BitmapFactory.Options();
            bounds.inJustDecodeBounds = true;
            BitmapFactory.decodeFile(file.getAbsolutePath(), bounds);
            if (bounds.outWidth <= 0 || bounds.outHeight <= 0) throw new Exception("فایل عکس معتبر نیست");
            int sample = 1;
            while (Math.max(bounds.outWidth / sample, bounds.outHeight / sample) > 3200) sample *= 2;
            BitmapFactory.Options options = new BitmapFactory.Options();
            options.inSampleSize = sample;
            options.inPreferredConfig = Bitmap.Config.ARGB_8888;
            bitmap = BitmapFactory.decodeFile(file.getAbsolutePath(), options);
            if (bitmap == null) throw new Exception("خواندن عکس دوربین ناموفق بود");

            ExifInterface exif = new ExifInterface(file.getAbsolutePath());
            int orientation = exif.getAttributeInt(ExifInterface.TAG_ORIENTATION, ExifInterface.ORIENTATION_NORMAL);
            Matrix matrix = new Matrix();
            switch (orientation) {
                case ExifInterface.ORIENTATION_ROTATE_90: matrix.postRotate(90); break;
                case ExifInterface.ORIENTATION_ROTATE_180: matrix.postRotate(180); break;
                case ExifInterface.ORIENTATION_ROTATE_270: matrix.postRotate(270); break;
                case ExifInterface.ORIENTATION_FLIP_HORIZONTAL: matrix.postScale(-1, 1); break;
                case ExifInterface.ORIENTATION_FLIP_VERTICAL: matrix.postScale(1, -1); break;
                case ExifInterface.ORIENTATION_TRANSPOSE: matrix.postScale(-1, 1); matrix.postRotate(90); break;
                case ExifInterface.ORIENTATION_TRANSVERSE: matrix.postScale(-1, 1); matrix.postRotate(270); break;
                default: break;
            }
            if (!matrix.isIdentity()) {
                Bitmap corrected = Bitmap.createBitmap(bitmap, 0, 0, bitmap.getWidth(), bitmap.getHeight(), matrix, true);
                if (corrected != bitmap) bitmap.recycle();
                bitmap = corrected;
            }
            ByteArrayOutputStream stream = new ByteArrayOutputStream();
            if (!bitmap.compress(Bitmap.CompressFormat.JPEG, 91, stream)) throw new Exception("فشرده‌سازی عکس ناموفق بود");
            String encoded = Base64.encodeToString(stream.toByteArray(), Base64.NO_WRAP);
            runOnUiThread(() -> {
                if (webView != null) webView.evaluateJavascript("window.receiveCameraPhoto('" + encoded + "')", null);
                Toast.makeText(MainActivity.this, "عکس اصلی با وضوح بالا آماده تحلیل است.", Toast.LENGTH_SHORT).show();
            });
        } catch (Exception e) {
            Log.e("YasinYar-Camera", "Full-resolution photo processing failed", e);
            runOnUiThread(() -> {
                if (webView != null) webView.evaluateJavascript("window.receiveCameraPhotoError && window.receiveCameraPhotoError()", null);
                Toast.makeText(MainActivity.this, "پردازش عکس ناموفق بود؛ دوباره عکس بگیر.", Toast.LENGTH_LONG).show();
            });
        } finally {
            if (bitmap != null && !bitmap.isRecycled()) bitmap.recycle();
            file.delete();
        }
    }

    @Override
    protected void onDestroy() {
        if (textToSpeech != null) {
            textToSpeech.stop();
            textToSpeech.shutdown();
        }
        cameraExecutor.shutdown();
        if (webView != null) webView.destroy();
        super.onDestroy();
    }
}
