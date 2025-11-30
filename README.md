# D2 Drip Extractor

A Next.js web application that extracts your Destiny 2 cosmetic collection (armor, shaders, ornaments) into an AI-readable JSON format. Use this data to generate outfit combinations with AI or analyze your fashion game collection.

## Overview

The D2 Drip Extractor integrates with the Bungie API to fetch comprehensive cosmetic data from your Destiny 2 account, including:

- **Shaders**: All owned shader cosmetics
- **Universal Ornaments (Transmog)**: Both owned and wishlist ornaments that can be applied to any eligible legendary armor
- **Armor-Specific Ornaments**: Exotic and set-specific ornaments unlocked in your collection
- **Armor Collection**: All legendary and exotic armor pieces from your Collections
- **Character Loadouts**: Currently equipped armor for each character with available ornament options

## Features

- 🔐 **Secure Authentication**: OAuth integration with Bungie.net via NextAuth
- 📊 **Comprehensive Data Extraction**: Pulls from Destiny 2 manifest and player profile data
- 💾 **Downloadable JSON**: Export your complete cosmetic inventory in a structured format
- 🎨 **Visual Preview**: Browse your collection with icons and detailed breakdowns
- 🤖 **AI-Ready Format**: Structured data perfect for use with AI tools to generate fashion combinations
- ⚡ **Real-Time Data**: Fetches the latest state of your account directly from Bungie servers

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org) (App Router)
- **Authentication**: [NextAuth.js](https://next-auth.js.org/) with Bungie OAuth
- **API Integration**: [Bungie.net API](https://bungie-net.github.io/multi/index.html)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Language**: TypeScript

## Getting Started

### Prerequisites

- Node.js 20+ installed
- A Bungie.net Developer account with an OAuth application configured
- Your Bungie API Key and OAuth credentials

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd d2-drip-extractor
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables (create a `.env.local` file):

```env
BUNGIE_API_KEY=your_bungie_api_key
BUNGIE_CLIENT_ID=your_oauth_client_id
BUNGIE_CLIENT_SECRET=your_oauth_client_secret
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret
```

4. Run the development server:

```bash
npm run dev
```

For HTTPS development (required for some OAuth flows):

```bash
npm run dev-https
```

5. Open [http://localhost:3000](http://localhost:3000) with your browser

### Authentication Setup

To use this application, you need to:

1. Visit [Bungie.net Applications](https://www.bungie.net/en/Application)
2. Create a new OAuth application
3. Set the OAuth redirect URL to `http://localhost:3000/api/auth/callback/bungie` (or your deployment URL)
4. Copy your API Key, Client ID, and Client Secret to your `.env.local` file

## How It Works

1. **Authentication**: Users authenticate via Bungie OAuth to grant access to their Destiny 2 account
2. **Manifest Loading**: The app downloads the latest Destiny 2 manifest definitions (inventory items, collectibles)
3. **Profile Fetching**: Retrieves player profile data including collectibles, character equipment, and inventory
4. **Data Processing**: Processes and categorizes cosmetics by type, class, and ownership status
5. **JSON Export**: Presents data in a structured format ready for download or AI consumption

## Data Structure

The exported JSON includes:

```typescript
{
  shaders: OwnedShader[],
  universalOrnamentsByClass: {
    hunter: OwnedArmorOrnament[],
    titan: OwnedArmorOrnament[],
    warlock: OwnedArmorOrnament[]
  },
  wishlistUniversalOrnamentsByClass: { /* same structure */ },
  armorSpecificOrnamentsByClass: { /* same structure */ },
  ownedArmorByClass: { /* armor items by class */ },
  ownedExoticArmor: OwnedArmorItem[],
  characterArmorDrip: CharacterArmorDrip[]
}
```

## Scripts

- `npm run dev` - Start development server
- `npm run dev-https` - Start development server with HTTPS
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Use Cases

- **AI Fashion Generation**: Feed your cosmetic data to AI models to generate outfit combinations
- **Collection Tracking**: Keep track of which ornaments and shaders you own
- **Loadout Planning**: See which ornaments are available for your currently equipped armor
- **Data Analysis**: Analyze your collection patterns and completion rates

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## License

This project is private and not licensed for public use.

## Acknowledgments

- Built with the [Bungie.net API](https://bungie-net.github.io/multi/index.html)
- Uses [bungie-api-ts](https://github.com/DestinyItemManager/bungie-api-ts) for type-safe API interactions
- Inspired by the Destiny 2 fashion and build-crafting community
