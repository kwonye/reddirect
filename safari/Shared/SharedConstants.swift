import Foundation

enum SharedConstants {
    #if os(macOS)
    static let extensionBundleID = "co.dgits.Reddirect.Extension"
    #else
    static let extensionBundleID = "co.dgits.Reddirect.iOS.Extension"
    #endif
}
