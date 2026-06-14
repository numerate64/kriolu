# Kriolu iPhone App Package

This app is packaged as an installable iPhone web app.

## Install on iPhone

1. Open `https://10.227.200.14/kriolu/` in Safari.
2. Tap Share.
3. Tap Add to Home Screen.
4. Name it `Kriolu` and tap Add.

The app includes home-screen metadata, icons, and a service worker so the dictionary can continue loading after it has been cached.

## Native iOS Build Note

Creating a signed `.ipa` requires macOS with Xcode and an Apple Developer signing identity. This package is ready for Safari home-screen install now; it can also be wrapped later with Capacitor or a WKWebView shell on a Mac.
