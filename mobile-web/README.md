# CMMS Mobile Web App

A Next.js mobile-optimized web application for field technicians to manage work orders, assets, and inventory. Access from any mobile browser without installation.

## 🎉 Now Connected to Real Database!

This app now displays **real data** from your CMMS Supabase database:
- ✅ Live work order counts and statistics
- ✅ Actual customer information
- ✅ Real vehicle details
- ✅ Current work order statuses
- ✅ Searchable and filterable data

See [DATABASE_INTEGRATION.md](./DATABASE_INTEGRATION.md) for full details.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Visit `http://localhost:3002` in your browser.

## 📱 Features

### Dashboard
- Real-time work order statistics
- Quick action buttons
- Recent work orders list
- Pull-to-refresh functionality

### Work Orders
- Complete work order list
- Search across all fields
- Filter by status (All, Open, In Progress, Completed)
- Detailed work order cards with customer and vehicle info

### Assets
- Asset management interface

### Profile
- User profile and statistics
- Settings menu
- Sign out functionality

## 🎨 Design

- Modern, mobile-first interface
- Touch-optimized with 44px+ touch targets
- Smooth animations and transitions
- Consistent design system
- Responsive layout

## 🗄️ Database

Connected to Supabase database with:
- Work orders
- Customers
- Vehicles
- Locations
- Technicians

## 📝 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## 🔧 Tech Stack

- **Framework**: Next.js 14
- **Language**: TypeScript
- **Styling**: CSS Modules / Inline Styles
- **Database**: Supabase
- **Icons**: Lucide React
- **State**: React Hooks

## 📂 Project Structure

```
mobile-web/
├── src/
│   ├── app/              # Next.js app router pages
│   │   ├── page.tsx      # Dashboard
│   │   ├── work-orders/  # Work orders page
│   │   ├── assets/       # Assets page
│   │   └── profile/      # Profile page
│   ├── components/       # Reusable components
│   ├── lib/              # Utilities and configs
│   │   └── supabase.ts   # Supabase client
│   └── types/            # TypeScript types
│       └── database.ts   # Database types
├── public/               # Static assets
└── package.json
```

## 🌐 Browser Support

- Chrome (mobile & desktop)
- Safari (iOS & macOS)
- Firefox (mobile & desktop)
- Edge

## 📱 Mobile Optimization

- Touch-friendly interface
- Safe area support for notched devices
- Prevent zoom on input focus
- Smooth scrolling
- Pull-to-refresh
- Bottom navigation

## 🔐 Security

- Uses Supabase Row Level Security
- Anon key for public access
- Same security policies as main app

## 📖 Documentation

- [IMPROVEMENTS.md](./IMPROVEMENTS.md) - UI/UX improvements
- [DATABASE_INTEGRATION.md](./DATABASE_INTEGRATION.md) - Database connection details

## 🐛 Troubleshooting

### Port Already in Use
If port 3002 is in use, try:
```bash
npx next dev -p 3003
```

### No Data Showing
- Check browser console for errors
- Verify Supabase connection
- Ensure work_orders table has data

### Build Errors
```bash
# Clear cache and reinstall
rm -rf .next node_modules
npm install
npm run build
```

## 🎯 Future Enhancements

- [ ] Real-time updates with Supabase subscriptions
- [ ] Offline support with service workers
- [ ] Push notifications

- [ ] Work order creation and updates
- [ ] Photo uploads
- [ ] Signature capture
- [ ] Dark mode
- [ ] PWA installation

## 📄 License

Part of the CMMS project.
