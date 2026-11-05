package ir.yasinyar.app;

import android.app.Activity;
import android.os.Bundle;
import android.content.Intent;\nimport android.net.Uri;\nimport android.webkit.WebResourceRequest;\nimport android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

public class MainActivity extends Activity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        WebView view = new WebView(this);
        view.setWebViewClient(new WebViewClient() {\n            @Override\n            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {\n                Uri uri = request.getUrl();\n                if (uri != null && (\"http\".equals(uri.getScheme()) || \"https\".equals(uri.getScheme()))) {\n                    startActivity(new Intent(Intent.ACTION_VIEW, uri));\n                    return true;\n                }\n                return false;\n            }\n        });
        WebSettings settings = view.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        view.loadUrl("file:///android_asset/index.html");
        setContentView(view);
    }
}
