//
//  ViewController.swift
//  Reddirect
//
//  Created by Will Kwon on 3/2/26.
//

import Cocoa
import SafariServices

let extensionBundleIdentifier = "co.dgits.reddirect.extension"

class ViewController: NSViewController {

    private let statusLabel = NSTextField(labelWithString: "Checking extension status…")
    private let openSettingsButton = NSButton(
        title: "Quit and Open Safari Settings…",
        target: nil,
        action: nil
    )

    override func loadView() {
        view = NSView()
        view.wantsLayer = true
    }

    override func viewDidLoad() {
        super.viewDidLoad()
        configureNativeUI()
        refreshExtensionState()
    }

    private func configureNativeUI() {
        statusLabel.translatesAutoresizingMaskIntoConstraints = false
        statusLabel.isEditable = false
        statusLabel.isSelectable = false
        statusLabel.isBezeled = false
        statusLabel.drawsBackground = false
        statusLabel.alignment = .center
        statusLabel.lineBreakMode = .byWordWrapping
        statusLabel.maximumNumberOfLines = 0
        statusLabel.font = NSFont.systemFont(ofSize: 14)

        openSettingsButton.translatesAutoresizingMaskIntoConstraints = false
        openSettingsButton.target = self
        openSettingsButton.action = #selector(openPreferences)
        openSettingsButton.bezelStyle = .rounded

        let stackView = NSStackView(views: [statusLabel, openSettingsButton])
        stackView.translatesAutoresizingMaskIntoConstraints = false
        stackView.orientation = .vertical
        stackView.alignment = .centerX
        stackView.spacing = 16

        view.addSubview(stackView)

        NSLayoutConstraint.activate([
            stackView.centerXAnchor.constraint(equalTo: view.centerXAnchor),
            stackView.centerYAnchor.constraint(equalTo: view.centerYAnchor),
            stackView.leadingAnchor.constraint(greaterThanOrEqualTo: view.leadingAnchor, constant: 24),
            stackView.trailingAnchor.constraint(lessThanOrEqualTo: view.trailingAnchor, constant: -24),
            statusLabel.widthAnchor.constraint(lessThanOrEqualToConstant: 360)
        ])
    }

    private func refreshExtensionState() {
        SFSafariExtensionManager.getStateOfSafariExtension(withIdentifier: extensionBundleIdentifier) { state, error in
            DispatchQueue.main.async {
                guard let state = state, error == nil else {
                    self.statusLabel.stringValue = "Unable to read extension state. Open Safari Settings to check it manually."
                    return
                }

                if state.isEnabled {
                    self.statusLabel.stringValue = "Reddirect’s extension is currently on. You can turn it off in Safari Settings."
                } else {
                    self.statusLabel.stringValue = "Reddirect’s extension is currently off. You can turn it on in Safari Settings."
                }
            }
        }
    }

    @objc private func openPreferences() {
        SFSafariApplication.showPreferencesForExtension(withIdentifier: extensionBundleIdentifier) { _ in
            DispatchQueue.main.async {
                NSApplication.shared.terminate(nil)
            }
        }
    }
}
