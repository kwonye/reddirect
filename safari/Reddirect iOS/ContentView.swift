import SwiftUI

struct ContentView: View {
    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                Spacer()

                heroSection

                Spacer()

                VStack(spacing: 16) {
                    openSettingsButton

                    fallbackDisclosure
                }
                .padding(.horizontal, 24)
                .padding(.bottom, 32)
            }
            .navigationTitle("Reddirect")
            .navigationBarTitleDisplayMode(.inline)
        }
    }

    private var heroSection: some View {
        VStack(spacing: 16) {
            Image("Logo")
                .resizable()
                .scaledToFit()
                .frame(width: 100, height: 100)
                .clipShape(RoundedRectangle(cornerRadius: 22, style: .continuous))

            Text("Reddirect")
                .font(.largeTitle.bold())

            Text("Redirects Reddit subdomains to canonical subreddit URLs for a consistent browsing experience.")
                .font(.body)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal, 32)
        }
    }

    private var openSettingsButton: some View {
        Button {
            if let url = URL(string: UIApplication.openSettingsURLString) {
                UIApplication.shared.open(url)
            }
        } label: {
            Text("Open Settings")
                .font(.headline)
                .frame(maxWidth: .infinity)
                .padding()
        }
        .buttonStyle(.borderedProminent)
        .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
    }

    private var fallbackDisclosure: some View {
        DisclosureGroup("How to enable Reddirect") {
            VStack(alignment: .leading, spacing: 12) {
                instructionStep("1", "Open the Settings app")
                instructionStep("2", "Scroll down and tap Safari")
                instructionStep("3", "Tap Extensions")
                instructionStep("4", "Toggle Reddirect to ON")
            }
            .padding(.top, 8)
        }
        .padding(20)
        .background(Color(.secondarySystemBackground))
        .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
    }

    @ViewBuilder
    private func instructionStep(_ number: String, _ text: String) -> some View {
        HStack(spacing: 12) {
            Text(number)
                .font(.headline)
                .frame(width: 28, height: 28)
                .background(Color.accentColor)
                .foregroundStyle(.white)
                .clipShape(Circle())
            Text(text)
                .font(.body)
            Spacer()
        }
    }
}

#Preview {
    ContentView()
}
