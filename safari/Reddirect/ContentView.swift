import SwiftUI
import SafariServices

struct ContentView: View {
    @State private var extensionEnabled: Bool? = nil

    var body: some View {
        VStack(spacing: 20) {
            Image("Logo")
                .resizable()
                .scaledToFit()
                .frame(width: 128, height: 128)

            statusPill

            Group {
                if let enabled = extensionEnabled {
                    Text(enabled
                         ? "Reddirect is redirecting Reddit subdomains in Safari. You can turn it off in Safari Extensions preferences."
                         : "Reddirect is currently off. You can turn it on in Safari Extensions preferences.")
                } else {
                    Text("You can turn on Reddirect in Safari Extensions preferences.")
                }
            }
            .multilineTextAlignment(.center)

            Button("Quit and Open Safari Extensions Preferences\u{2026}") {
                SFSafariApplication.showPreferencesForExtension(
                    withIdentifier: SharedConstants.extensionBundleID
                ) { _ in
                    DispatchQueue.main.async {
                        NSApplication.shared.terminate(nil)
                    }
                }
            }
        }
        .padding(40)
        .frame(width: 420)
        .onAppear {
            SFSafariExtensionManager.getStateOfSafariExtension(
                withIdentifier: SharedConstants.extensionBundleID
            ) { state, error in
                DispatchQueue.main.async {
                    if let state, error == nil {
                        extensionEnabled = state.isEnabled
                    }
                }
            }
        }
    }

    @ViewBuilder
    private var statusPill: some View {
        if let enabled = extensionEnabled {
            Label(
                enabled ? "Extension On" : "Extension Off",
                systemImage: enabled ? "checkmark.circle.fill" : "circle"
            )
            .foregroundStyle(enabled ? Color.green : Color.secondary)
            .font(.callout.weight(.medium))
            .padding(.horizontal, 12)
            .padding(.vertical, 6)
            .background(
                Capsule().fill((enabled ? Color.green : Color.secondary).opacity(0.12))
            )
        }
    }
}
