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
import java.io.ByteArrayOutputStream;

public class MainActivity extends Activity {
    private ValueCallback<Uri[]> filePathCallback;
    private WebView webView;
    private static final int FILE_CHOOSER_REQUEST = 1001;
    private static final int CAMERA_REQUEST = 1002;

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
}
