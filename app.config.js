// app.config.js
import "dotenv/config";

export default {
  expo: {
    name: "Poise",
    slug: "ChatBot",
    version: "1.0.2",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "automatic",
    scheme: "poise",
    newArchEnabled: true,
    splash: {
      image: "./assets/transparent-icon.png",
      resizeMode: "contain",
      backgroundColor: "#0A0A0A",
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.djdallas.Poise",
      buildNumber: "1",
      icon: "./assets/Final-custom-ios-icon.png",
      infoPlist: {
        NSUserTrackingUsageDescription:
          "This identifier helps us personalize your experience and provide relevant content.",
        NSCameraUsageDescription:
          "Poise uses your camera to capture profile photos.",
        NSPhotoLibraryUsageDescription:
          "Poise accesses your photo library to select screenshots for analysis.",
        NSPhotoLibraryAddUsageDescription:
          "Poise can save analyzed screenshots to your library.",
        ITSAppUsesNonExemptEncryption: false,
        LSApplicationQueriesSchemes: ["https", "http"],
        CFBundleDocumentTypes: [
          {
            CFBundleTypeName: "Images",
            CFBundleTypeRole: "Viewer",
            LSHandlerRank: "Alternate",
            LSItemContentTypes: ["public.image", "public.jpeg", "public.png"],
          },
        ],
        UTImportedTypeDeclarations: [],
        UIFileSharingEnabled: false,
        LSSupportsOpeningDocumentsInPlace: false,
      },
      config: {
        usesNonExemptEncryption: false,
      },
      associatedDomains: ["applinks:api.poise.app"],
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#0A0A0A",
      },
      package: "com.djdallas.Poise",
      versionCode: 1,
      intentFilters: [
        {
          action: "VIEW",
          autoVerify: true,
          data: [{ scheme: "poise" }],
          category: ["BROWSABLE", "DEFAULT"],
        },
        {
          action: "VIEW",
          autoVerify: true,
          data: [
            {
              scheme: "https",
              host: "*.poise.app",
              pathPrefix: "/subscription",
            },
          ],
          category: ["BROWSABLE", "DEFAULT"],
        },
        {
          action: "SEND",
          data: [{ mimeType: "image/*" }],
          category: ["DEFAULT"],
        },
        {
          action: "SEND_MULTIPLE",
          data: [{ mimeType: "image/*" }],
          category: ["DEFAULT"],
        },
      ],
    },
    web: {
      favicon: "./assets/favicon.png",
      bundler: "metro",
    },
    plugins: [
      [
        "expo-build-properties",
        {
          ios: {
            useFrameworks: "static",
            deploymentTarget: "15.1",
          },
        },
      ],
    ],
    extra: {
      // These will be populated from environment variables during EAS build
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
      apiKey: process.env.API_KEY,
      apiUrl: process.env.API_URL,
      revenuecatApiKey: process.env.REVENUECAT_API_KEY,
      revenuecatIosKey: process.env.REVENUECAT_IOS_KEY,
      revenuecatAndroidKey: process.env.REVENUECAT_ANDROID_KEY,
      revenuecatEntitlementId: process.env.REVENUECAT_ENTITLEMENT_ID,
      revenuecatProjectId: process.env.REVENUECAT_PROJECT_ID,
      revenuecatAppId: process.env.REVENUECAT_APP_ID,
      revenuecatOfferingId: process.env.REVENUECAT_OFFERING_ID,
      revenuecatProductWeekly: process.env.REVENUECAT_PRODUCT_WEEKLY,
      revenuecatProductMonthly: process.env.REVENUECAT_PRODUCT_MONTHLY,
      revenuecatProductAnnual: process.env.REVENUECAT_PRODUCT_ANNUAL,
      eas: {
        projectId: "b4788237-6b09-4525-bff4-e73b9548c71c",
      },
    },
    owner: "djdallas",
  },
};
