package ir.yasinyar.app;

import android.Manifest;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.graphics.Rect;
import android.os.Bundle;
import android.view.Gravity;
import android.view.MotionEvent;
import android.view.View;
import android.widget.Button;
import android.widget.FrameLayout;
import android.widget.LinearLayout;
import android.widget.SeekBar;
import android.widget.TextView;
import android.widget.Toast;
import androidx.activity.ComponentActivity;
import androidx.camera.core.Camera;
import androidx.camera.core.CameraSelector;
import androidx.camera.core.FocusMeteringAction;
import androidx.camera.core.AspectRatio;
import androidx.camera.core.ImageCapture;
import androidx.camera.core.ImageCaptureException;
import androidx.camera.core.MeteringPointFactory;
import androidx.camera.core.Preview;
import androidx.camera.lifecycle.ProcessCameraProvider;
import androidx.camera.view.PreviewView;
import androidx.core.content.ContextCompat;
import androidx.lifecycle.Observer;
import com.google.common.util.concurrent.ListenableFuture;
import java.io.File;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

public class CameraCaptureActivity extends ComponentActivity {
    private static final int CAMERA_PERMISSION = 701;
    private PreviewView previewView;
    private ImageCapture imageCapture;
    private Camera camera;
    private ExecutorService executor;
    private TextView status;
    private Button flashButton;
    private boolean flashOn = false;
    private boolean capturing = false;
    private SeekBar zoomBar;

    @Override protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        executor = Executors.newSingleThreadExecutor();
        buildCameraUi();
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA) == PackageManager.PERMISSION_GRANTED) {
            startCamera();
        } else {
            requestPermissions(new String[]{Manifest.permission.CAMERA}, CAMERA_PERMISSION);
        }
    }

    private int dp(float value) { return (int)(value * getResources().getDisplayMetrics().density + 0.5f); }

    private void buildCameraUi() {
        FrameLayout root = new FrameLayout(this);
        root.setBackgroundColor(Color.BLACK);
        previewView = new PreviewView(this);
        previewView.setImplementationMode(PreviewView.ImplementationMode.COMPATIBLE);
        previewView.setScaleType(PreviewView.ScaleType.FILL_CENTER);
        root.addView(previewView, new FrameLayout.LayoutParams(-1, -1));

        LinearLayout top = new LinearLayout(this);
        top.setGravity(Gravity.CENTER_VERTICAL);
        top.setPadding(dp(12), dp(12), dp(12), dp(12));
        top.setBackgroundColor(0x99081728);
        Button close = makeButton("✕");
        close.setOnClickListener(v -> finish());
        flashButton = makeButton("⚡ خاموش");
        flashButton.setOnClickListener(v -> toggleFlash());
        status = new TextView(this);
        status.setText("صفحه را صاف و کامل داخل کادر بگیر");
        status.setTextColor(Color.WHITE);
        status.setTextSize(12);
        status.setGravity(Gravity.CENTER);
        LinearLayout.LayoutParams statusParams = new LinearLayout.LayoutParams(0, -2, 1);
        statusParams.setMargins(dp(8), 0, dp(8), 0);
        top.addView(close);
        top.addView(status, statusParams);
        top.addView(flashButton);
        FrameLayout.LayoutParams topParams = new FrameLayout.LayoutParams(-1, -2, Gravity.TOP);
        root.addView(top, topParams);

        LinearLayout bottom = new LinearLayout(this);
        bottom.setOrientation(LinearLayout.VERTICAL);
        bottom.setGravity(Gravity.CENTER);
        bottom.setPadding(dp(18), dp(12), dp(18), dp(20));
        bottom.setBackgroundColor(0xCC081728);

        TextView zoomLabel = new TextView(this);
        zoomLabel.setText("بزرگ‌نمایی");
        zoomLabel.setTextColor(Color.WHITE);
        zoomLabel.setTextSize(12);
        zoomLabel.setGravity(Gravity.CENTER);
        bottom.addView(zoomLabel, new LinearLayout.LayoutParams(-1, -2));
        zoomBar = new SeekBar(this);
        zoomBar.setMax(100);
        zoomBar.setProgress(0);
        zoomBar.setOnSeekBarChangeListener(new SeekBar.OnSeekBarChangeListener() {
            @Override public void onProgressChanged(SeekBar seekBar, int progress, boolean fromUser) {
                if (fromUser && camera != null && camera.getCameraInfo().getZoomState().getValue() != null) {
                    float max = camera.getCameraInfo().getZoomState().getValue().getMaxZoomRatio();
                    float min = camera.getCameraInfo().getZoomState().getValue().getMinZoomRatio();
                    camera.getCameraControl().setZoomRatio(min + (max - min) * progress / 100f);
                }
            }
            @Override public void onStartTrackingTouch(SeekBar seekBar) {}
            @Override public void onStopTrackingTouch(SeekBar seekBar) {}
        });
        bottom.addView(zoomBar, new LinearLayout.LayoutParams(-1, dp(35)));

        LinearLayout actions = new LinearLayout(this);
        actions.setGravity(Gravity.CENTER);
        Button capture = makeButton("●  ثبت عکس باکیفیت");
        capture.setTextSize(16);
        capture.setPadding(dp(28), dp(12), dp(28), dp(12));
        capture.setBackgroundTintList(android.content.res.ColorStateList.valueOf(0xFFF2C66D));
        capture.setTextColor(0xFF17243B);
        capture.setOnClickListener(v -> capturePhoto(capture));
        actions.addView(capture);
        bottom.addView(actions);

        TextView hint = new TextView(this);
        hint.setText("برای فوکوس روی نوشته، همان نقطه را لمس کن • نور کافی و بدون سایه");
        hint.setTextColor(0xFFD5E0EF);
        hint.setTextSize(11);
        hint.setGravity(Gravity.CENTER);
        LinearLayout.LayoutParams hintParams = new LinearLayout.LayoutParams(-1, -2);
        hintParams.topMargin = dp(7);
        bottom.addView(hint, hintParams);
        FrameLayout.LayoutParams bottomParams = new FrameLayout.LayoutParams(-1, -2, Gravity.BOTTOM);
        root.addView(bottom, bottomParams);

        previewView.setOnTouchListener((v, event) -> {
            if (event.getAction() == MotionEvent.ACTION_UP && camera != null) {
                MeteringPointFactory factory = previewView.getMeteringPointFactory();
                FocusMeteringAction action = new FocusMeteringAction.Builder(factory.createPoint(event.getX(), event.getY()))
                    .setAutoCancelDuration(4, TimeUnit.SECONDS).build();
                camera.getCameraControl().startFocusAndMetering(action);
                status.setText("در حال فوکوس روی نقطه انتخاب‌شده…");
            }
            return true;
        });
        setContentView(root);
    }

    private Button makeButton(String label) {
        Button b = new Button(this);
        b.setText(label);
        b.setTextColor(Color.WHITE);
        b.setTextSize(12);
        b.setAllCaps(false);
        b.setMinWidth(dp(48));
        b.setPadding(dp(8), dp(6), dp(8), dp(6));
        b.setBackgroundTintList(android.content.res.ColorStateList.valueOf(0xFF263D5F));
        return b;
    }

    private void startCamera() {
        ListenableFuture<ProcessCameraProvider> future = ProcessCameraProvider.getInstance(this);
        future.addListener(() -> {
            try {
                ProcessCameraProvider provider = future.get();
                Preview preview = new Preview.Builder().build();
                preview.setSurfaceProvider(previewView.getSurfaceProvider());
                // Let CameraX select a supported high-resolution 4:3 stream.
                // A hard-coded 3000x4000 target can be unsupported on many phones
                // and prevent the entire camera from binding.
                imageCapture = new ImageCapture.Builder()
                    .setCaptureMode(ImageCapture.CAPTURE_MODE_MAXIMIZE_QUALITY)
                    .setJpegQuality(95)
                    .setTargetAspectRatio(AspectRatio.RATIO_4_3)
                    .build();
                provider.unbindAll();
                camera = provider.bindToLifecycle(this, CameraSelector.DEFAULT_BACK_CAMERA, preview, imageCapture);
                camera.getCameraInfo().getZoomState().observe(this, state -> {
                    if (state != null && zoomBar != null) {
                        float range = state.getMaxZoomRatio() - state.getMinZoomRatio();
                        if (range > 0) zoomBar.setProgress(Math.round((state.getZoomRatio() - state.getMinZoomRatio()) / range * 100));
                    }
                });
                flashButton.setEnabled(camera.getCameraInfo().hasFlashUnit());
                status.setText("دوربین آماده است؛ روی نوشته لمس کن تا فوکوس شود");
            } catch (Exception e) {
                status.setText("راه‌اندازی دوربین ناموفق بود: " + e.getMessage());
            }
        }, ContextCompat.getMainExecutor(this));
    }

    private void toggleFlash() {
        if (camera == null || !camera.getCameraInfo().hasFlashUnit()) {
            Toast.makeText(this, "فلش در دسترس نیست.", Toast.LENGTH_SHORT).show();
            return;
        }
        flashOn = !flashOn;
        camera.getCameraControl().enableTorch(flashOn);
        flashButton.setText(flashOn ? "⚡ روشن" : "⚡ خاموش");
    }

    private void capturePhoto(Button button) {
        if (imageCapture == null || capturing) return;
        capturing = true;
        button.setEnabled(false);
        status.setText("در حال ثبت عکس با وضوح بالا…");
        File dir = new File(getCacheDir(), "camera");
        if (!dir.exists()) dir.mkdirs();
        File output = new File(dir, "yasinyar_" + System.currentTimeMillis() + ".jpg");
        ImageCapture.OutputFileOptions options = new ImageCapture.OutputFileOptions.Builder(output).build();
        imageCapture.takePicture(options, ContextCompat.getMainExecutor(this), new ImageCapture.OnImageSavedCallback() {
            @Override public void onImageSaved(ImageCapture.OutputFileResults result) {
                android.content.Intent data = new android.content.Intent();
                data.putExtra("camera_file_path", output.getAbsolutePath());
                setResult(RESULT_OK, data);
                finish();
            }
            @Override public void onError(ImageCaptureException error) {
                capturing = false;
                button.setEnabled(true);
                status.setText("ثبت عکس ناموفق بود؛ دوباره تلاش کن.");
                Toast.makeText(CameraCaptureActivity.this, error.getMessage(), Toast.LENGTH_LONG).show();
            }
        });
    }

    @Override public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode == CAMERA_PERMISSION) {
            if (grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED) startCamera();
            else {
                Toast.makeText(this, "برای استفاده از دوربین باید اجازه دوربین را فعال کنی.", Toast.LENGTH_LONG).show();
                setResult(RESULT_CANCELED);
                finish();
            }
        }
    }

    @Override protected void onDestroy() {
        if (camera != null) camera.getCameraControl().enableTorch(false);
        if (executor != null) executor.shutdown();
        super.onDestroy();
    }
}
