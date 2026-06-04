-- =============================================
-- VEDICBOX - COMPLETE SUPABASE DATABASE SCHEMA
-- =============================================
-- Run this ENTIRE file in Supabase SQL Editor
-- Dashboard → SQL Editor → New Query → Paste → Run
-- =============================================

-- 1. PROFILES (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT,
  phone TEXT UNIQUE,
  email TEXT,
  avatar_url TEXT,
  addresses JSONB DEFAULT '[]'::jsonb,
  wishlist TEXT[] DEFAULT '{}',
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', 'User'),
    NEW.email,
    NEW.phone
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. PRODUCTS
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  name_hindi TEXT,
  category TEXT NOT NULL CHECK (category IN ('vastu', 'puja')),
  sub_category TEXT,
  price INTEGER NOT NULL,
  original_price INTEGER,
  discount INTEGER DEFAULT 0,
  rating REAL DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  image TEXT,
  images JSONB DEFAULT '[]'::jsonb,
  description TEXT,
  includes JSONB DEFAULT '[]'::jsonb,
  benefits JSONB DEFAULT '[]'::jsonb,
  instructions JSONB DEFAULT '[]'::jsonb,
  tags TEXT[] DEFAULT '{}',
  is_bestseller BOOLEAN DEFAULT FALSE,
  is_new BOOLEAN DEFAULT FALSE,
  is_festival_special BOOLEAN DEFAULT FALSE,
  for_type TEXT[] DEFAULT '{}',
  in_stock BOOLEAN DEFAULT TRUE,
  stock_quantity INTEGER DEFAULT 100,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. ORDERS
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id),
  items JSONB NOT NULL,
  subtotal INTEGER NOT NULL,
  coupon_code TEXT,
  coupon_discount INTEGER DEFAULT 0,
  shipping_charge INTEGER DEFAULT 0,
  total_amount INTEGER NOT NULL,
  payment_method TEXT CHECK (payment_method IN ('upi', 'card', 'cod')),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  payment_id TEXT,
  shipping_address JSONB NOT NULL,
  status TEXT DEFAULT 'placed' CHECK (status IN ('placed', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled', 'returned')),
  tracking_number TEXT,
  estimated_delivery DATE,
  status_history JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. REVIEWS
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id TEXT REFERENCES public.products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id),
  user_name TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. COUPONS
CREATE TABLE IF NOT EXISTS public.coupons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  discount_percent INTEGER NOT NULL,
  max_discount INTEGER,
  min_order_amount INTEGER DEFAULT 0,
  valid_from TIMESTAMPTZ DEFAULT NOW(),
  valid_until TIMESTAMPTZ,
  usage_limit INTEGER DEFAULT 100,
  used_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE
);

-- 6. CONSULTATIONS
CREATE TABLE IF NOT EXISTS public.consultations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id),
  consultant_name TEXT NOT NULL,
  type TEXT CHECK (type IN ('vastu', 'puja')),
  mode TEXT CHECK (mode IN ('video', 'phone')),
  consultation_date DATE NOT NULL,
  consultation_time TEXT NOT NULL,
  price INTEGER NOT NULL,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed')),
  payment_id TEXT,
  status TEXT DEFAULT 'booked' CHECK (status IN ('booked', 'completed', 'cancelled', 'no_show')),
  meeting_link TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. SUBSCRIPTIONS
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id),
  plan_id TEXT NOT NULL,
  plan_name TEXT NOT NULL,
  price INTEGER NOT NULL,
  frequency TEXT CHECK (frequency IN ('monthly', 'quarterly')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'cancelled')),
  next_delivery_date DATE,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  paused_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  payment_history JSONB DEFAULT '[]'::jsonb
);

-- 8. CART ITEMS
CREATE TABLE IF NOT EXISTS public.cart_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_id TEXT REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INTEGER DEFAULT 1 CHECK (quantity > 0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- 9. DAILY TIPS
CREATE TABLE IF NOT EXISTS public.daily_tips (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT,
  icon TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  publish_date DATE DEFAULT CURRENT_DATE
);

-- 10. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT,
  type TEXT DEFAULT 'promo' CHECK (type IN ('order_update', 'promo', 'tip', 'reminder')),
  data JSONB,
  is_read BOOLEAN DEFAULT FALSE,
  sent_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_tips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- PUBLIC READ (anyone can read)
CREATE POLICY "products_public_read" ON public.products FOR SELECT USING (true);
CREATE POLICY "tips_public_read" ON public.daily_tips FOR SELECT USING (true);
CREATE POLICY "coupons_public_read" ON public.coupons FOR SELECT USING (is_active = true);
CREATE POLICY "reviews_public_read" ON public.reviews FOR SELECT USING (true);

-- PROFILES
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- ORDERS
CREATE POLICY "orders_select_own" ON public.orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "orders_insert_own" ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "orders_update_own" ON public.orders FOR UPDATE USING (auth.uid() = user_id);

-- CART
CREATE POLICY "cart_all_own" ON public.cart_items FOR ALL USING (auth.uid() = user_id);

-- REVIEWS
CREATE POLICY "reviews_insert_auth" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = user_id);

-- CONSULTATIONS
CREATE POLICY "consultations_select_own" ON public.consultations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "consultations_insert_own" ON public.consultations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "consultations_update_own" ON public.consultations FOR UPDATE USING (auth.uid() = user_id);

-- SUBSCRIPTIONS
CREATE POLICY "subscriptions_all_own" ON public.subscriptions FOR ALL USING (auth.uid() = user_id);

-- NOTIFICATIONS
CREATE POLICY "notifications_select_own" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "notifications_update_own" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

-- =============================================
-- INDEXES (for performance)
-- =============================================

CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_bestseller ON public.products(is_bestseller) WHERE is_bestseller = true;
CREATE INDEX IF NOT EXISTS idx_products_festival ON public.products(is_festival_special) WHERE is_festival_special = true;
CREATE INDEX IF NOT EXISTS idx_orders_user ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_reviews_product ON public.reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_cart_user ON public.cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_consultations_user ON public.consultations(user_id);

-- =============================================
-- SEED DATA - PRODUCTS
-- =============================================

INSERT INTO public.products (id, name, name_hindi, category, sub_category, price, original_price, discount, rating, review_count, image, images, description, includes, benefits, instructions, tags, is_bestseller, is_new, is_festival_special, for_type, in_stock, stock_quantity) VALUES

-- VASTU KITS
('v1', 'Vastu Dosh Nivaran Kit', 'वास्तु दोष निवारण किट', 'vastu', 'Dosh Nivaran', 2499, 3999, 38, 4.8, 324, './images/vastu-kit.jpg', '["./images/vastu-kit.jpg","./images/puja-kit.jpg"]', 'Complete Vastu Dosh Nivaran Kit to neutralize negative energies and restore harmony in your home. Energized by Vedic pandits with authentic mantras.', '["Vastu Yantra (Copper)","Vastu Pyramid Set (5 pcs)","Rock Salt Crystal","Camphor Tablets","Sacred Thread (Mauli)","Guggul Dhoop","Instruction Booklet","Energized Water Vessel"]', '["Removes Vastu defects from home","Brings peace and prosperity","Protects from negative energies","Improves family harmony","Enhances positive vibrations"]', '["Clean the area with Gangajal","Place Yantra in the center of home","Arrange pyramids in 5 directions","Light Guggul Dhoop","Recite the provided mantras 11 times","Tie sacred thread at entrance"]', '{"bestseller","vastu","home"}', true, false, false, '{"home"}', true, 150),

('v2', 'Griha Pravesh Kit', 'गृह प्रवेश किट', 'vastu', 'New Home', 3499, 5499, 36, 4.9, 198, './images/puja-kit.jpg', '["./images/puja-kit.jpg","./images/vastu-kit.jpg"]', 'Auspicious Griha Pravesh ceremony kit with all essential items for a blessed new beginning in your new home.', '["Kalash Set (Brass)","Mango Leaves","Sacred Rice (Akshata)","Turmeric & Kumkum","Coconut","Ghee Lamp","Incense Sticks (Premium)","Swastik Sticker Set","Red Cloth","Gangajal Bottle"]', '["Ensures auspicious entry","Purifies the new space","Invokes divine blessings","Protects from evil eye","Brings good fortune"]', '["Perform at auspicious muhurta","Place Kalash at entrance","Light ghee lamp","Apply turmeric & kumkum at doorstep","Break coconut at threshold","Enter with right foot first"]', '{"new-home","vastu","auspicious"}', false, true, false, '{"home"}', true, 80),

('v3', 'Office Vastu Correction Kit', 'ऑफिस वास्तु किट', 'vastu', 'Office', 1999, 3299, 39, 4.7, 156, './images/vastu-kit.jpg', '["./images/vastu-kit.jpg"]', 'Transform your office energy with this powerful Vastu correction kit designed for professional spaces.', '["Office Vastu Yantra","Crystal Globe","Feng Shui Tortoise","Lucky Bamboo Seeds","Desk Pyramid","Positive Energy Spray"]', '["Improves productivity","Enhances career growth","Attracts opportunities","Reduces workplace conflicts","Brings financial stability"]', '["Place Yantra on north wall","Keep crystal globe on desk","Position tortoise near entrance","Place pyramid on work desk","Spray positive energy mist weekly"]', '{"office","vastu","career"}', false, false, false, '{"office"}', true, 120),

('v4', 'Wealth & Prosperity Kit', 'धन समृद्धि किट', 'vastu', 'Wealth', 2999, 4999, 40, 4.9, 412, './images/puja-kit.jpg', '["./images/puja-kit.jpg"]', 'Attract wealth, abundance, and financial prosperity with this powerful Vastu remedy kit blessed by Vedic scholars.', '["Kuber Yantra (Gold Plated)","Lakshmi Idol (Brass)","Money Plant Seeds","Prosperity Incense","Citrine Crystal","Green Aventurine Stone","Wealth Affirmation Card"]', '["Attracts wealth and money","Opens new income sources","Removes financial blocks","Enhances savings","Brings abundance"]', '["Place Kuber Yantra in north","Position Lakshmi idol in east","Plant money plant in southeast","Light prosperity incense daily","Keep crystals in cash box"]', '{"wealth","vastu","bestseller"}', true, false, false, '{"home","office","business"}', true, 200),

('v5', 'Nazar Dosh Protection Kit', 'नज़र दोष निवारण किट', 'vastu', 'Protection', 1499, 2499, 40, 4.6, 267, './images/vastu-kit.jpg', '["./images/vastu-kit.jpg"]', 'Shield your home and family from evil eye and negative energies with this powerful protection kit.', '["Nazar Battu (7 Chili & Lemon)","Black Tourmaline Crystal","Evil Eye Wall Hanging","Protection Yantra","Black Salt","Loban Dhoop","Nimbu Mirchi Thread"]', '["Protects from evil eye","Removes negative energy","Shields family members","Creates protective barrier","Wards off jealousy"]', '["Hang Nazar Battu at entrance","Place tourmaline at main door","Burn Loban every Saturday","Sprinkle black salt at corners","Place yantra above main door"]', '{"protection","vastu","home"}', false, false, false, '{"home","shop"}', true, 180),

('v6', 'Business Growth Kit', 'व्यापार वृद्धि किट', 'vastu', 'Business', 3999, 6499, 38, 4.8, 89, './images/puja-kit.jpg', '["./images/puja-kit.jpg"]', 'Supercharge your business growth with this premium Vastu kit designed for entrepreneurs and business owners.', '["Vyapar Vridhi Yantra","Mercury Shivling","Gomti Chakra Set","Business Growth Incense","Prosperity Crystal Grid","Success Mantra Book"]', '["Boosts business revenue","Attracts new customers","Removes business obstacles","Enhances reputation","Ensures steady growth"]', '["Place Yantra in cash counter area","Keep Shivling in north","Distribute Gomti Chakras at 4 corners","Light incense at opening time","Read success mantras daily"]', '{"business","vastu","growth"}', false, true, false, '{"business","shop"}', true, 60),

('v7', 'Pyramid Energy Kit', 'पिरामिड ऊर्जा किट', 'vastu', 'Energy', 1799, 2999, 40, 4.5, 143, './images/vastu-kit.jpg', '["./images/vastu-kit.jpg"]', 'Harness the ancient power of pyramids to balance and enhance energy flow in your living space.', '["9 Pyramid Vastu Set","Center Pyramid (Large)","Directional Pyramids (8 pcs)","Energy Grid Mat","Compass","Placement Guide"]', '["Balances energy flow","Enhances meditation","Improves sleep quality","Reduces stress","Amplifies positive energy"]', '["Use compass to find directions","Place grid mat in center of room","Position large pyramid at center","Place directional pyramids correctly","Activate with provided mantras"]', '{"pyramid","vastu","energy"}', false, false, false, '{"home","office"}', true, 90),

('v8', 'Vastu for Shop Kit', 'दुकान वास्तु किट', 'vastu', 'Shop', 2299, 3799, 39, 4.7, 178, './images/puja-kit.jpg', '["./images/puja-kit.jpg"]', 'Specially designed for retail shops and commercial spaces to attract more customers and increase sales.', '["Shop Vastu Yantra","Welcome Swastik","Customer Attraction Crystal","Cash Box Energizer","Entrance Purifier","Daily Mantra Card"]', '["Attracts more customers","Increases daily sales","Creates positive shop energy","Enhances brand image","Ensures repeat customers"]', '["Fix Swastik at shop entrance","Place Yantra behind cash counter","Keep crystal near billing area","Energize cash box on Thursdays","Recite daily mantra at shop opening"]', '{"shop","vastu","business"}', false, false, false, '{"shop","business"}', true, 100),

-- PUJA KITS
('p1', 'Satyanarayan Puja Kit', 'सत्यनारायण पूजा किट', 'puja', 'Regular Puja', 1299, 1999, 35, 4.9, 567, './images/puja-kit.jpg', '["./images/puja-kit.jpg","./images/vastu-kit.jpg"]', 'Complete Satyanarayan Puja Kit with all authentic items for performing the sacred puja at home.', '["Satyanarayan Photo Frame","Puja Thali Set","Panchamrit Ingredients","Banana Leaves","Sacred Thread","Roli & Chawal","Prasad Mix","Dhoop & Agarbatti","Camphor","Instruction Manual with Katha"]', '["Fulfills wishes","Brings family harmony","Ensures divine blessings","Removes obstacles","Brings prosperity"]', '["Fast on puja day","Set up puja area with clean cloth","Place photo frame and kalash","Follow step-by-step katha book","Distribute prasad to 5 families"]', '{"puja","satyanarayan","bestseller"}', true, false, false, '{"home"}', true, 250),

('p2', 'Ganesh Puja Kit', 'गणेश पूजा किट', 'puja', 'Festival', 999, 1599, 37, 4.8, 445, './images/vastu-kit.jpg', '["./images/vastu-kit.jpg"]', 'Premium Ganesh Puja Kit for Ganesh Chaturthi and regular Ganpati worship with eco-friendly clay idol.', '["Eco-Friendly Ganesh Idol","Modak Mould","Durva Grass","Red Flowers","Sindoor","Puja Thali","Laddu Gopal Dress","Aarti Book","Bell"]', '["Removes obstacles","Brings wisdom","Ensures new beginnings","Attracts success","Protects family"]', '["Install idol facing east","Offer durva grass first","Apply sindoor on forehead","Offer 21 modaks","Perform aarti morning and evening","Visarjan on designated day"]', '{"puja","ganesh","festival"}', false, false, true, '{"home"}', true, 300),

('p3', 'Lakshmi Puja Kit', 'लक्ष्मी पूजा किट', 'puja', 'Wealth Puja', 1499, 2499, 40, 4.9, 389, './images/puja-kit.jpg', '["./images/puja-kit.jpg"]', 'Invoke Goddess Lakshmi blessings with this premium puja kit for wealth, prosperity, and abundance.', '["Lakshmi Idol (Brass)","Lotus Flowers (Artificial)","Gold Coins Set","Lakshmi Yantra","Premium Agarbatti","Kumkum & Haldi","Red Chunari","Puja Vidhi Book"]', '["Attracts wealth","Brings financial stability","Blesses with prosperity","Removes poverty","Ensures abundance"]', '["Clean puja area thoroughly","Place Lakshmi idol on red cloth","Arrange lotus flowers around idol","Light lamp with ghee","Recite Lakshmi Chalisa","Offer gold coins symbolically"]', '{"puja","lakshmi","wealth","bestseller"}', true, false, false, '{"home","business"}', true, 200),

('p4', 'Navratri Puja Kit', 'नवरात्रि पूजा किट', 'puja', 'Festival', 1799, 2999, 40, 4.7, 234, './images/vastu-kit.jpg', '["./images/vastu-kit.jpg"]', 'Complete 9-day Navratri puja kit with items for each day worship of Goddess Durga nine forms.', '["9 Color Chunaris","Durga Idol","Akhand Jyoti Set","Daily Offering Items","Kumkum Set (9 colors)","Coconuts (9)","Garland Set","Navratri Katha Book","Havan Samagri"]', '["Divine mother blessings","Destroys negativity","Brings courage","Fulfills desires","Spiritual awakening"]', '["Start on Pratipada tithi","Establish Kalash on Day 1","Change chunari color daily","Perform daily aarti","Fast for 9 days","Kanya pujan on Ashtami/Navami"]', '{"puja","navratri","festival"}', false, false, true, '{"home"}', true, 150),

('p5', 'Rudrabhishek Kit', 'रुद्राभिषेक किट', 'puja', 'Shiva Puja', 2199, 3499, 37, 4.8, 167, './images/puja-kit.jpg', '["./images/puja-kit.jpg"]', 'Sacred Rudrabhishek Kit for performing powerful Shiva puja with authentic abhishek materials.', '["Shivling (Narmadeshwar)","Abhishek Pot (Brass)","Bilva Patra","Raw Milk Container","Honey Jar","Gangajal","Dhatura Flowers","Rudraksha Mala","Vibhuti","Puja Guide"]', '["Destroys sins","Brings peace of mind","Heals diseases","Removes fear","Grants moksha"]', '["Wake up at Brahma Muhurta","Bathe and wear white clothes","Place Shivling on altar","Perform abhishek with 5 liquids","Offer bilva patra","Chant Om Namah Shivaya 108 times"]', '{"puja","shiva","rudrabhishek"}', false, false, false, '{"home"}', true, 80),

('p6', 'Shradh Puja Kit', 'श्राद्ध पूजा किट', 'puja', 'Ancestor Puja', 999, 1699, 41, 4.6, 98, './images/vastu-kit.jpg', '["./images/vastu-kit.jpg"]', 'Complete Shradh ceremony kit for performing ancestral rituals with devotion and authenticity.', '["Pind Daan Items","Black Sesame Seeds","Barley","Kusha Grass","Sacred Water Vessel","White Cloth","Offering Thali","Ritual Guide Book"]', '["Appeases ancestors","Removes Pitru Dosh","Brings family peace","Ensures ancestral blessings","Clears karmic debts"]', '["Perform during Shradh period","Face south during ritual","Prepare pind with listed items","Offer water with sesame seeds","Feed Brahmins and cows","Donate to charity"]', '{"puja","shradh","ancestors"}', false, false, false, '{"home"}', true, 70),

('p7', 'Diwali Puja Kit', 'दिवाली पूजा किट', 'puja', 'Festival', 2499, 3999, 37, 4.9, 678, './images/puja-kit.jpg', '["./images/puja-kit.jpg"]', 'Grand Diwali Puja Kit for Lakshmi-Ganesh worship with premium quality items and festive decorations.', '["Lakshmi-Ganesh Idol Set","Silver Coin","Premium Diyas (21 pcs)","Rangoli Stencils","Marigold Garlands","Mishri & Dry Fruits","Puja Thali (Decorated)","LED String Lights","Account Book (Bahi Khata)","Complete Puja Samagri"]', '["Lakshmi-Ganesh blessings","Financial prosperity all year","Removes darkness of ignorance","Family togetherness","New financial beginnings"]', '["Clean entire house before Diwali","Make rangoli at entrance","Place idols on red cloth","Light 21 diyas at sunset","Perform Lakshmi-Ganesh aarti","Open new account book","Distribute sweets"]', '{"puja","diwali","festival","bestseller"}', true, false, true, '{"home","business","shop"}', true, 500),

('p8', 'Monthly Home Puja Kit', 'मासिक गृह पूजा किट', 'puja', 'Monthly', 699, 999, 30, 4.7, 312, './images/vastu-kit.jpg', '["./images/vastu-kit.jpg"]', 'Monthly subscription puja kit with fresh items delivered to your doorstep for daily worship.', '["Premium Agarbatti (30 packs)","Camphor Tablets (50 pcs)","Cotton Wicks","Kumkum & Haldi","Ghee (Pure Cow)","Flower Seeds","Prasad Mix","Monthly Panchang Calendar"]', '["Never run out of puja items","Fresh quality guaranteed","Saves time and money","Ensures daily worship","Monthly spiritual guidance"]', '["Items designed for 30 days use","Light agarbatti during morning puja","Use camphor for evening aarti","Prepare prasad with provided mix","Follow panchang for special days"]', '{"puja","monthly","subscription"}', false, false, false, '{"home"}', true, 1000)

ON CONFLICT (id) DO NOTHING;

-- =============================================
-- SEED DATA - COUPONS
-- =============================================

INSERT INTO public.coupons (code, discount_percent, max_discount, min_order_amount, valid_until, is_active) VALUES
('WELCOME15', 15, 500, 999, '2026-12-31', true),
('PUJA20', 20, 800, 1499, '2026-12-31', true),
('DIWALI30', 30, 1500, 2499, '2026-12-31', true),
('FIRST25', 25, 1000, 999, '2026-12-31', true),
('VASTU10', 10, 400, 499, '2026-12-31', true)
ON CONFLICT (code) DO NOTHING;

-- =============================================
-- SEED DATA - DAILY TIPS
-- =============================================

INSERT INTO public.daily_tips (title, content, category, icon) VALUES
('Entrance Direction', 'Keep your main entrance well-lit and clutter-free. A clean entrance attracts positive energy and prosperity.', 'Vastu', '🚪'),
('Kitchen Placement', 'The ideal placement for kitchen is the Southeast corner. Always face East while cooking for positive energy.', 'Vastu', '🍳'),
('Morning Mantra', 'Start your day with "Om Gam Ganapataye Namaha" 11 times to remove obstacles and bring success.', 'Mantra', '🕉️'),
('Money Corner', 'Place a money plant in the Southeast corner of your home. Water it regularly for financial growth.', 'Prosperity', '💰'),
('Bedroom Peace', 'Never place a mirror facing the bed. It disturbs sleep and can cause relationship issues.', 'Vastu', '🛏️'),
('Evening Ritual', 'Light a ghee diya in the evening at your puja space. It purifies the atmosphere and brings divine energy.', 'Ritual', '🪔');

-- =============================================
-- SEED DATA - REVIEWS
-- =============================================

INSERT INTO public.reviews (product_id, user_name, rating, comment, is_verified, created_at) VALUES
('v1', 'Rajesh Sharma', 5, 'Amazing kit! Everything was well packed and authentic. The instructions were very clear. Noticed positive changes within a week.', true, '2024-01-15'),
('v1', 'Priya Gupta', 5, 'Best quality puja items I have ever received. The brass items are genuine and the packaging was premium. Highly recommended!', true, '2024-01-10'),
('v4', 'Amit Patel', 4, 'Good quality products. Delivery was on time. The instruction booklet was very helpful for performing the puja correctly.', true, '2024-01-08'),
('p1', 'Sunita Devi', 5, 'मैंने यह किट अपने नए घर के लिए खरीदी। बहुत अच्छी quality है। सब authentic items हैं।', true, '2024-01-05'),
('v3', 'Vikram Singh', 5, 'Outstanding! The vastu kit has truly transformed the energy of my office. Business has improved noticeably.', true, '2024-01-03'),
('p7', 'Meena Kumari', 5, 'Diwali puja kit was complete and premium quality. The diyas and rangoli stencils were beautiful!', true, '2024-02-10'),
('p3', 'Ravi Kumar', 4, 'Lakshmi Puja Kit is very good. All items are authentic. Packaging could be slightly better.', true, '2024-02-08'),
('v2', 'Anjali Mishra', 5, 'Griha Pravesh kit made our new home entry very auspicious. Everything was included. Very satisfied!', true, '2024-03-01');

-- =============================================
-- DONE! Your VedicBox database is ready 🙏
-- =============================================
