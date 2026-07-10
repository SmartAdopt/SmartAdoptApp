# How to Update Mobile App Icons (Android & iOS)

This project uses `@capacitor/assets` to automatically generate all the required native icon sizes and splash screens for mobile platforms.

## Prerequisites
If not already installed, install the asset generator tool inside the `frontend` directory:
```bash
npm install -D @capacitor/assets
```

## Steps to Update the Icon

1. **Prepare your new icon:**
   - Must be a `.png` file.
   - Must have a solid background (no transparency).
   - Recommended minimum resolution: `1024x1024` pixels.

2. **Replace the source file:**
   - Place your new image at `frontend/assets/icon-only.png`.
   - *(Note: If you also want to update the splash screen, place a `splash.png` in the same folder).*

3. **Generate the native assets:**
   - Open your terminal at the root of the project (`SmartAdoptApp`).
   - Run the following command:
     ```bash
     npx capacitor-assets generate --android
     ```
     *(Add `--ios` at the end if you ever add iOS support).*

4. **Verify the changes:**
   - The command will overwrite the files inside `android/app/src/main/res/`.
   - You can open Android Studio manually to run the app and verify the new icon on an emulator.

5. **Commit your changes:**
   - Do not forget to commit and push the updated files in the `android/` directory!
