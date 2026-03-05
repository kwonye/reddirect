import SwiftUI
import SafariServices

let extensionBundleIdentifier = "co.dgits.Reddirect.Extension"

struct ContentView: View {
    @State private var extensionEnabled: Bool? = nil

    var body: some View {
        VStack(spacing: 20) {
            Image("Logo")
                .resizable()
                .scaledToFit()
                .frame(width: 128, height: 128)

            Group {
                if let enabled = extensionEnabled {
                    if enabled {
                        Text("Reddirect's extension is currently on. You can turn it off in Safari Extensions preferences.")
                    } else {
                        Text("Reddirect's extension is currently off. You can turn it on in Safari Extensions preferences.")
                    }
                } else {
                    Text("You can turn on Reddirect's extension in Safari Extensions preferences.")
                }
            }
            .multilineTextAlignment(.center)

            Button("Quit and Open Safari Extensions Preferences…") {
                SFSafariApplication.showPreferencesForExtension(withIdentifier: extensionBundleIdentifier) { _ in
                    DispatchQueue.main.async {
                        NSApplication.shared.terminate(nil)
                    }
                }
            }
        }
        .padding(40)
        .frame(width: 420)
        .onAppear {
            SFSafariExtensionManager.getStateOfSafariExtension(withIdentifier: extensionBundleIdentifier) { state, error in
                DispatchQueue.main.async {
                    if let state = state, error == nil {
                        extensionEnabled = state.isEnabled
                    }
                }
            }
        }
    }
}
