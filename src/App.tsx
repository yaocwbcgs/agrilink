import { Suspense, lazy, useEffect, type ReactNode } from 'react'
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'
import { Header } from './components/layout/Header'
import { Footer } from './components/layout/Footer'
import { Toaster } from './components/ui/Toaster'
import { ErrorBoundary } from './components/ErrorBoundary'
import Home from './pages/Home'

const DiseaseIdentify = lazy(() => import('./pages/DiseaseIdentify'))
const DiseaseLibrary = lazy(() => import('./pages/DiseaseLibrary'))
const DiseaseDetail = lazy(() => import('./pages/DiseaseDetail'))
const Market = lazy(() => import('./pages/Market'))
const ListingDetail = lazy(() => import('./pages/ListingDetail'))
const ListingPublish = lazy(() => import('./pages/ListingPublish'))
const MarketMatch = lazy(() => import('./pages/MarketMatch'))
const Machinery = lazy(() => import('./pages/Machinery'))
const MachineryDetail = lazy(() => import('./pages/MachineryDetail'))
const Shop = lazy(() => import('./pages/Shop'))
const ProductDetail = lazy(() => import('./pages/ProductDetail'))
const Cart = lazy(() => import('./pages/Cart'))
const Checkout = lazy(() => import('./pages/Checkout'))
const Prices = lazy(() => import('./pages/Prices'))
const PriceDetail = lazy(() => import('./pages/PriceDetail'))
const News = lazy(() => import('./pages/News'))
const NewsDetail = lazy(() => import('./pages/NewsDetail'))
const SearchPage = lazy(() => import('./pages/Search'))
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const NotFound = lazy(() => import('./pages/NotFound'))
const UserLayout = lazy(() => import('./pages/user/UserLayout').then((m) => ({ default: m.UserLayout })))
const UserOverview = lazy(() => import('./pages/user/UserOverview'))
const UserListings = lazy(() => import('./pages/user/UserListings'))
const UserBookings = lazy(() => import('./pages/user/UserBookings'))
const UserOrders = lazy(() => import('./pages/user/UserOrders'))
const UserFavorites = lazy(() => import('./pages/user/UserFavorites'))
const UserInquiries = lazy(() => import('./pages/user/UserInquiries'))
const UserNotifications = lazy(() => import('./pages/user/UserNotifications'))
const UserAddresses = lazy(() => import('./pages/user/UserAddresses'))
const UserProfile = lazy(() => import('./pages/user/UserProfile'))
const UserSettings = lazy(() => import('./pages/user/UserSettings'))

function ScrollToTop() {
  const { pathname, search } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [pathname, search])
  return null
}

function PageFade({ children }: { children: ReactNode }) {
  const { pathname } = useLocation()
  return (
    <div key={pathname} className="animate-fade-in">
      {children}
    </div>
  )
}

function RouteFallback() {
  return (
    <div className="shell py-16">
      <div className="skeleton h-8 w-56 rounded-md" />
      <div className="mt-4 skeleton h-4 w-80 rounded" />
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="rounded-panel border border-line bg-white p-4">
            <div className="skeleton h-32 w-full rounded-lg" />
            <div className="mt-3 skeleton h-4 w-3/4 rounded" />
            <div className="mt-2 skeleton h-3 w-1/2 rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">
          <ErrorBoundary>
            <PageFade>
              <Suspense fallback={<RouteFallback />}>
                <Routes>
                  <Route path="/" element={<Home />} />

                  <Route path="/disease" element={<DiseaseIdentify />} />
                  <Route path="/disease/library" element={<DiseaseLibrary />} />
                  <Route path="/disease/library/:id" element={<DiseaseDetail />} />

                  <Route path="/market" element={<Market />} />
                  <Route path="/market/publish" element={<ListingPublish />} />
                  <Route path="/market/match" element={<MarketMatch />} />
                  <Route path="/market/:id" element={<ListingDetail />} />

                  <Route path="/machinery" element={<Machinery />} />
                  <Route path="/machinery/:id" element={<MachineryDetail />} />

                  <Route path="/shop" element={<Shop />} />
                  <Route path="/shop/:id" element={<ProductDetail />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/checkout" element={<Checkout />} />

                  <Route path="/prices" element={<Prices />} />
                  <Route path="/prices/:id" element={<PriceDetail />} />

                  <Route path="/news" element={<News />} />
                  <Route path="/news/:id" element={<NewsDetail />} />

                  <Route path="/search" element={<SearchPage />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />

                  <Route path="/user" element={<UserLayout />}>
                    <Route index element={<UserOverview />} />
                    <Route path="listings" element={<UserListings />} />
                    <Route path="bookings" element={<UserBookings />} />
                    <Route path="orders" element={<UserOrders />} />
                    <Route path="favorites" element={<UserFavorites />} />
                    <Route path="inquiries" element={<UserInquiries />} />
                    <Route path="notifications" element={<UserNotifications />} />
                    <Route path="addresses" element={<UserAddresses />} />
                    <Route path="profile" element={<UserProfile />} />
                    <Route path="settings" element={<UserSettings />} />
                  </Route>

                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </PageFade>
          </ErrorBoundary>
        </main>
        <Footer />
      </div>
      <Toaster />
    </BrowserRouter>
  )
}
