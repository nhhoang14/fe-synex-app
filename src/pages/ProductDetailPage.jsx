import { useEffect, useMemo, useState, useCallback } from 'react'
import { Link, useParams } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'
import { usePageTitle } from '../hooks/usePageTitle'
import { getProductById, getProducts } from '../services/catalogService'
import { ROUTES } from '../constants'
import {
  formatCurrency,
  getProductId,
  getProductImage,
  normalizeImageUrl,
  getProductName,
  getProductPrice,
} from '../utils/normalizers'

const StarDisplay = ({ rating, size = 18 }) => {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => {
        // Tính toán độ lệch giữa điểm số và vị trí sao hiện tại (1-5)
        // Ví dụ: rating = 4.5, s = 5 => diff = 0.5
        // Dùng Math.round để tránh sai số dấu phẩy động (0.1+0.2)
        const diff = Math.round(rating * 10) / 10 - (s - 1)
        
        let iconName = 'star'
        let className = 'material-icons text-amber-400'

        if (diff > 0.5) {
          // Trường hợp trên 0.5: Hiện thêm 1 sao (Sao đầy)
          iconName = 'star'
          className = 'material-icons text-amber-400'
        } else if (diff === 0.5) {
          // Trường hợp đúng 0.5: Hiện nửa sao
          iconName = 'star_half'
          className = 'material-icons text-amber-400'
        } else {
          // Trường hợp dưới 0.5: Hiện sao rỗng (Outline)
          iconName = 'star_border'
          className = 'material-icons text-slate-300'
        }

        return (
          <span
            key={s}
            className={className}
            style={{ fontSize: `${size}px` }}
          >
            {iconName}
          </span>
        )
      })}
    </div>
  )
}

function ProductDetailPage() {
  const { id } = useParams()
  const { addToCart } = useCart()
  const { token, isAuthenticated, loadProfile, isAdmin } = useAuth()

  const [product, setProduct] = useState(null)
  const [allProducts, setAllProducts] = useState([])
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)
  const [selectedAttributes, setSelectedAttributes] = useState({})
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [profile, setProfile] = useState(null)

  // State Review
  const [reviews, setReviews] = useState([])
  const [ratingSummary, setRatingSummary] = useState({ average: 0, total: 0 })
  const [userReview, setUserReview] = useState({ rating: 5, comment: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isEditingReview, setIsEditingReview] = useState(false)
  const [myReview, setMyReview] = useState(null)
  const [hoverRating, setHoverRating] = useState(0)

  // State Toast Notification
  const [message, setMessage] = useState('')
  const [progress, setProgress] = useState(100)

  // State quản lý danh sách sản phẩm đã thích
  const [likedIds, setLikedIds] = useState([])

  usePageTitle(product ? `${getProductName(product)} - Synex` : 'Chi tiết sản phẩm - Synex')

  // Tự động ẩn thông báo sau 3 giây và chạy thanh progress
  useEffect(() => {
    if (message) {
      setProgress(100)
      const animTimer = setTimeout(() => setProgress(0), 50)
      const closeTimer = setTimeout(() => setMessage(''), 3000)
      return () => {
        clearTimeout(animTimer)
        clearTimeout(closeTimer)
      }
    }
  }, [message])

  function loadLikedIds() {
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]')
    setLikedIds(wishlist.map((item) => getProductId(item)).filter(Boolean))
  }

  useEffect(() => {
    let mounted = true

    if (isAuthenticated) {
      loadProfile().then(p => {
        if (mounted) setProfile(p)
      }).catch(() => {})
    }

    async function loadData() {
      try {
        setLoading(true)

        const [productData, productList] = await Promise.all([
          getProductById(id),
          getProducts(),
        ])

        if (!mounted) return

        setProduct(productData || null)
        setAllProducts(Array.isArray(productList) ? productList : [])
      } catch {
        if (!mounted) return
        setProduct(null)
        setAllProducts([])
      } finally {
        if (mounted) setLoading(false)
      }
    }

    loadData()

    return () => {
      mounted = false
    }
  }, [id])

  const fetchReviews = useCallback(async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'
      const res = await fetch(`${API_URL}/api/reviews/product/${id}`)
      if (res.ok) {
        const data = await res.json()
        // Hỗ trợ cả trường hợp Backend trả về mảng (List) hoặc đối tượng Page (.content)
        const reviewList = Array.isArray(data) ? data : (data?.content || [])
        setReviews(reviewList)
        
        // Tự tính toán thống kê vì API trả về mảng đơn thuần
        const total = reviewList.length
        const avg = total > 0 ? reviewList.reduce((sum, r) => sum + r.rating, 0) / total : 0
        setRatingSummary({
          average: Number(avg),
          total: total
        })

        // Tìm đánh giá của bản thân nếu đã đăng nhập
        if (profile && isAuthenticated) {
          const found = reviewList.find(r => 
            r.userId && r.userId === profile.id
          )
          if (found) {
            setMyReview(found)
            setUserReview({ rating: found.rating, comment: found.comment })
          } else {
            setMyReview(null)
          }
        }
      }
    } catch (err) { console.error("Lỗi tải đánh giá:", err) }
  }, [id, profile, isAuthenticated])

  useEffect(() => {
    if (id) fetchReviews()
  }, [id, fetchReviews])

  useEffect(() => {
    loadLikedIds()
    window.addEventListener('wishlistUpdated', loadLikedIds)

    return () => {
      window.removeEventListener('wishlistUpdated', loadLikedIds)
    }
  }, [])

  const relatedProducts = useMemo(() => {
    if (!product || !Array.isArray(allProducts)) return []

    const currentId = String(getProductId(product))
    const currentCategory = String(
      product?.category?.name || product?.categoryName || '',
    ).toLowerCase()

    return allProducts
      .filter((item) => String(getProductId(item)) !== currentId)
      .filter((item) => {
        const itemCategory = String(
          item?.category?.name || item?.categoryName || '',
        ).toLowerCase()

        if (!currentCategory) return true
        return itemCategory === currentCategory
      })
      .slice(0, 4)
  }, [product, allProducts])

  // Mappings và logic tìm biến thể
  const attributeMap = useMemo(() => {
    if (!product?.variants) return {}
    const map = {}
    product.variants.forEach((v) => {
      v.attributes?.forEach((attr) => {
        const name = String(attr.attributeName || '').trim() // Gộp các thuộc tính trùng tên sau khi trim
        if (!map[name]) map[name] = new Set()
        map[name].add(attr.attributeValue)
      })
    })
    Object.keys(map).forEach((key) => (map[key] = Array.from(map[key])))
    return map
  }, [product])

  useEffect(() => {
    // Khởi tạo thuộc tính trống để người dùng tự chọn (hoặc chọn sẵn cái đầu tiên tùy ý bạn)
    // Ở đây tôi để trống để thỏa mãn yêu cầu "nếu không chọn gì sẽ hiện tổng số lượng"
    setSelectedAttributes({})
  }, [product])

  const selectedVariant = useMemo(() => {
    if (!product?.variants || Object.keys(selectedAttributes).length === 0) return null
    return product.variants.find((v) =>
      Array.isArray(v.attributes) && v.attributes.every((attr) => selectedAttributes[String(attr.attributeName || '').trim()] === attr.attributeValue),
    )
  }, [product, selectedAttributes])

  // Logic kiểm tra xem một giá trị thuộc tính có hợp lệ với các lựa chọn hiện tại không
  const isOptionDisabled = (attrName, attrValue) => {
    if (!product?.variants) return false
    // Tìm xem có biến thể nào chứa giá trị này VÀ khớp với các thuộc tính ĐÃ chọn ở các nhóm khác không
    return !product.variants.some((v) => {
      const hasCurrentAttr = Array.isArray(v.attributes) && v.attributes.some(
        (a) => String(a.attributeName || '').trim() === attrName && a.attributeValue === attrValue
      )
      if (!hasCurrentAttr) return false

      // Kiểm tra xem biến thể này có khớp với các thuộc tính khác đã chọn không
      return Object.entries(selectedAttributes).every(([sName, sValue]) => {
        if (sName === attrName) return true // Bỏ qua chính nhóm đang xét
        return Array.isArray(v.attributes) && v.attributes.some(
          (a) => String(a.attributeName || '').trim() === sName && a.attributeValue === sValue
        )
      })
    })
  }

  const handleAttributeClick = (attrName, val) => {
    setSelectedAttributes((prev) => {
      const next = { ...prev }
      // Nếu giá trị đã được chọn rồi thì xóa đi (bỏ chọn), ngược lại thì chọn giá trị mới
      if (next[attrName] === val) {
        delete next[attrName]
      } else {
        next[attrName] = val
      }
      return next
    })
  }

  async function handleAddToCart() {
    const variantId = selectedVariant?.id || null

    if (!variantId && product?.variants?.length > 0) {
      setMessage('Vui lòng chọn đầy đủ các thuộc tính sản phẩm')
      return
    }

    // Kiểm tra tồn kho của variant
    const variantStock = selectedVariant ? (selectedVariant.stock ?? selectedVariant.stockQuantity ?? 0) : 0
    if (selectedVariant && quantity > variantStock) {
      setMessage(`Số lượng vượt quá tồn kho của phiên bản (${variantStock})`)
      return
    }

    try {
      await addToCart(quantity, variantId)
      setMessage('Đã thêm vào giỏ hàng')
    } catch (error) {
      setMessage(error.message || 'Không thể thêm vào giỏ hàng')
    }
  }

  async function handleToggleWishlist(event, itemToToggle) {
    if (event) {
      event.preventDefault()
      event.stopPropagation()
    }

    const productId = getProductId(itemToToggle)
    if (!productId) return

    if (!isAuthenticated) {
      setMessage('Vui lòng đăng nhập để yêu thích sản phẩm!')
      return
    }

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'
      const res = await fetch(`${API_URL}/api/wishlist/${productId}/toggle`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!res.ok) throw new Error('Không thể cập nhật danh sách yêu thích.')

    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]')
    const exists = wishlist.some((item) => getProductId(item) === productId)

      const updatedWishlist = !exists
        ? [...wishlist, itemToToggle]
        : wishlist.filter((item) => getProductId(item) !== productId)

      localStorage.setItem('wishlist', JSON.stringify(updatedWishlist))
      window.dispatchEvent(new Event('wishlistUpdated'))

      setMessage(!exists ? 'Đã thêm vào yêu thích!' : 'Đã bỏ yêu thích.')
    } catch (err) {
      setMessage(err.message)
    }
  }

  const isSuccess = message.toLowerCase().includes('đã') || message.toLowerCase().includes('thành công')

  // --- CÁC HÀM XỬ LÝ ĐÁNH GIÁ (REVIEW) ---
  async function handleSubmitReview(e) {
    e.preventDefault()
    if (!isAuthenticated) return setMessage('Vui lòng đăng nhập để đánh giá')
    if (!userReview.comment.trim()) return setMessage('Vui lòng nhập nội dung đánh giá')

    setIsSubmitting(true)
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'
      // Cập nhật đường dẫn khớp với ReviewController
      const url = myReview 
        ? `${API_URL}/api/reviews/${myReview.id}`
        : `${API_URL}/api/reviews`
        
      const res = await fetch(url, {
        method: myReview ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        // Thêm productId vào payload khi tạo mới
        body: JSON.stringify({
          ...userReview,
          productId: !myReview ? Number(id) : undefined
        })
      })
      if (!res.ok) throw new Error('Không thể gửi đánh giá')
      setMessage(myReview ? 'Đã cập nhật đánh giá!' : 'Cảm ơn bạn đã đánh giá sản phẩm!')
      setIsEditingReview(false)
      fetchReviews()
    } catch (err) {
      setMessage(err.message)
    } finally { setIsSubmitting(false) }
  }

  async function handleDeleteReview(reviewId) {
    if (!window.confirm('Xóa vĩnh viễn đánh giá này?')) return
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'
      // Sử dụng đúng endpoint từ ReviewController: DELETE /api/reviews/{reviewId}
      const res = await fetch(`${API_URL}/api/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })

      if (res.ok) {
        fetchReviews()
        setMessage('Đã xóa đánh giá thành công')
      } else throw new Error('Không thể xóa đánh giá')
    } catch (err) { setMessage(err.message) }
  }

  // Tập hợp tất cả ảnh: Biến thể hiện trước, ảnh chung hiện sau theo yêu cầu
  const allImages = useMemo(() => {
    if (!product) return []
    
    // 1. Lấy ảnh từ tất cả các variant
    const variantImages = product.variants?.map(v => v.imageUrl).filter(Boolean).map(path => normalizeImageUrl(path)) || []
    
    // 2. Lấy ảnh chung của sản phẩm (từ mảng productImages hoặc images)
    const productLevelImages = (product.productImages || product.images || [])
      .map(img => typeof img === 'string' ? img : (img.url || img.imageUrl || img.imagePath))
      .filter(Boolean)
      .map(path => normalizeImageUrl(path))
    
    // 3. Ảnh đại diện chính (nếu có)
    const rawMainImg = product.imageUrl || product.image || product.thumbnail;
    const mainImg = rawMainImg ? normalizeImageUrl(rawMainImg) : null;
    
    const combined = [...variantImages, ...productLevelImages]
    if (mainImg && !combined.includes(mainImg)) combined.push(mainImg)
    
    const uniqueImages = Array.from(new Set(combined));
    return uniqueImages;
  }, [product])

  // Tự động chuyển ảnh khi người dùng chọn biến thể có ảnh riêng
  useEffect(() => {
    if (selectedVariant?.imageUrl) {
      // Phải chuẩn hóa URL của variant trước khi tìm kiếm trong mảng allImages
      const normalizedVariantImg = normalizeImageUrl(selectedVariant.imageUrl)
      const idx = allImages.indexOf(normalizedVariantImg)
      if (idx !== -1) setCurrentImageIndex(idx)
    }
  }, [selectedVariant, allImages])

  // CHÚ Ý: Phải di chuyển logic tính toán và Hooks lên trên các câu lệnh return sớm (if loading/!product)
  // để đảm bảo thứ tự gọi Hooks luôn nhất quán (Rules of Hooks)
  const productId = getProductId(product)
  const productName = getProductName(product)
  const price = selectedVariant ? Number(selectedVariant.price) : getProductPrice(product)
  const categoryName = product?.category?.name || product?.categoryName || 'Đang cập nhật'
  const brandName = product?.brand?.name || product?.brandName || 'Đang cập nhật'
  const description =
    product?.description ||
    product?.details ||
    'Sản phẩm công nghệ chính hãng tại Synex, thiết kế hiện đại và phù hợp cho nhu cầu học tập, làm việc và giải trí hằng ngày.'

  const stock =
    typeof product?.stock === 'number'
      ? product.stock
      : typeof product?.quantity === 'number'
        ? product.quantity
        : null
        
  const totalStock = useMemo(() => {
    if (!Array.isArray(product?.variants)) return stock || 0
    return product.variants.reduce((sum, v) => sum + (v.stock || v.stockQuantity || 0), 0)
  }, [product, stock])

  const displayStock = selectedVariant ? (selectedVariant.stock ?? selectedVariant.stockQuantity ?? 0) : totalStock

  const soldCount = product?.soldQuantity || product?.sold || 0
  const formattedSold =
    soldCount >= 1000000
      ? (soldCount / 1000000).toFixed(1).replace(/\.0$/, '') + 'm'
      : soldCount >= 1000
        ? (soldCount / 1000).toFixed(1).replace(/\.0$/, '') + 'k'
        : soldCount

  const isMainProductLiked = likedIds.includes(productId)

  if (loading) {
    return (
      <section className="rounded-[28px] border border-border bg-white p-8 shadow-sm">
        <p className="text-slate-600">Đang tải chi tiết sản phẩm...</p>
      </section>
    )
  }

  if (!product) {
    return (
      <section className="rounded-[28px] border border-border bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-ink">Không tìm thấy sản phẩm</h1>
        <p className="mt-3 text-slate-600">
          Sản phẩm này có thể không tồn tại hoặc đã bị xoá.
        </p>
        <Link
          to={ROUTES.PRODUCTS}
          className="mt-5 inline-flex rounded-full bg-slate-900 px-5 py-3 font-semibold text-white transition hover:bg-slate-800"
        >
          Quay lại trang sản phẩm
        </Link>
      </section>
    )
  }

  return (
    <div className="space-y-6">
      
      {/* TOAST THÔNG BÁO NỔI DẠNG OVERLAY */}
      {message && (
        <div className="fixed top-8 left-1/2 z-[9999] flex min-w-[320px] -translate-x-1/2 items-center justify-between overflow-hidden rounded-lg border border-slate-100 bg-white px-4 py-3 shadow-2xl animate-in slide-in-from-top-4 fade-in duration-300">
          <div className="flex items-center gap-3">
            <div className={`flex h-5 w-5 items-center justify-center rounded-full text-white ${isSuccess ? 'bg-green-500' : 'bg-red-500'}`}>
              {isSuccess ? (
                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg>
              ) : (
                <span className="text-xs font-bold">!</span>
              )}
            </div>
            <span className="text-sm font-medium text-slate-700">{message}</span>
          </div>
          <button onClick={() => setMessage('')} className="ml-6 text-slate-400 hover:text-slate-600 transition">
            ✕
          </button>
          <div 
            className={`absolute bottom-0 left-0 h-1 transition-all duration-[3000ms] ease-linear ${isSuccess ? 'bg-green-500' : 'bg-red-500'}`} 
            style={{ width: `${progress}%` }} 
          />
        </div>
      )}

      <nav className="text-sm text-slate-500">
        <Link to={ROUTES.HOME} className="hover:text-slate-900">
          Trang chủ
        </Link>
        <span className="mx-2">/</span>
        <Link to={ROUTES.PRODUCTS} className="hover:text-slate-900">
          Sản phẩm
        </Link>
        <span className="mx-2">/</span>
        <span className="text-slate-900">{productName}</span>
      </nav>

      <section className="rounded-[28px] border border-border bg-white p-6 shadow-sm">
        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          {/* KHU VỰC HIỂN THỊ HÌNH ẢNH & SLIDER */}
          <div className="flex flex-col gap-4">
            <div className="relative group overflow-hidden rounded-[28px] bg-slate-50 aspect-square">
              <img
                src={allImages[currentImageIndex] || getProductImage(product)}
                key={currentImageIndex}
                alt={productName}
                className="h-full w-full object-cover transition-transform duration-500"
              />
              
              {allImages.length > 1 && (
                <>
                  {/* Nút chuyển ảnh Trái/Phải */}
                  <button 
                    type="button"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCurrentImageIndex(prev => (prev === 0 ? allImages.length - 1 : prev - 1)); }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-ink shadow-md opacity-0 group-hover:opacity-100 transition hover:bg-white"
                  >
                    <span className="material-symbols-outlined">chevron_left</span>
                  </button>
                  <button 
                    type="button"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCurrentImageIndex(prev => (prev === allImages.length - 1 ? 0 : prev + 1)); }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-ink shadow-md opacity-0 group-hover:opacity-100 transition hover:bg-white"
                  >
                    <span className="material-symbols-outlined">chevron_right</span>
                  </button>
                  
                  {/* Indicators (Dấu chấm) */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {allImages.map((_, i) => (
                      <div key={i} className={`h-1.5 rounded-full transition-all ${i === currentImageIndex ? 'w-6 bg-sky-500' : 'w-1.5 bg-slate-300'}`} />
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Danh sách ảnh thu nhỏ (Thumbnails) */}
            {allImages.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2 filter-scrollbar">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-2 transition-all ${
                      currentImageIndex === idx ? 'border-sky-500 ring-4 ring-sky-100' : 'border-slate-100 hover:border-slate-300'
                    }`}
                  >
                    <img src={img} className="h-full w-full object-cover" alt={`thumb-${idx}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-sky-50 px-4 py-2 text-sm font-medium text-sky-700">
                  {categoryName}
                </span>
                <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700">
                  {brandName}
                </span>
              </div>
              <span className="text-sm font-bold uppercase tracking-wider text-slate-400">
                Đã bán {formattedSold}
              </span>
            </div>

            <h1 className="text-3xl font-bold leading-tight text-ink sm:text-4xl">
              {productName}
            </h1>

            {/* STAR RATING SUMMARY */}
            <div className="mt-2 flex items-center gap-2">
              <StarDisplay rating={ratingSummary.average} />
              <span className="text-sm font-bold text-slate-700">{ratingSummary.average.toFixed(1)}</span>
              <span className="text-sm text-slate-400">({ratingSummary.total} đánh giá)</span>
            </div>

            <p className="mt-4 text-3xl font-bold text-slate-900">{formatCurrency(price)}</p>

            <div className="mt-5 grid gap-3 rounded-3xl bg-slate-50 p-5 sm:grid-cols-2">
              <div>
                <p className="text-sm text-slate-500">Tình trạng</p>
                <p className="mt-1 font-semibold text-ink">
                  {displayStock > 0 ? `Còn ${displayStock} sản phẩm` : 'Hết hàng'}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-500">Mã sản phẩm</p>
                <p className="mt-1 font-semibold text-ink">{selectedVariant?.sku || productId || 'N/A'}</p>
              </div>
            </div>

            {/* CHỌN THUỘC TÍNH SẢN PHẨM */}
            {Object.keys(attributeMap).map((attrName) => (
              <div key={attrName} className="mt-6">
                <h3 className="text-[13px] font-bold text-slate-500 uppercase tracking-wider">
                  {attrName}
                </h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {attributeMap[attrName].map((val) => {
                    const isActive = selectedAttributes[attrName] === val
                    const disabled = isOptionDisabled(attrName, val)

                    return (
                      <button
                        key={val}
                        disabled={disabled}
                        onClick={() => handleAttributeClick(attrName, val)}
                        className={`rounded-xl border px-4 py-2 text-sm font-bold transition-all ${
                          isActive
                            ? 'border-sky-500 bg-sky-50 text-sky-700 shadow-sm'
                            : disabled ? 'border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed' : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                        } ${disabled ? 'opacity-50' : ''}`}
                      >
                        {val}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}

            <div className="mt-6">
              <h2 className="text-lg font-bold text-ink">Mô tả sản phẩm</h2>
              <p className="mt-3 leading-7 text-slate-600">{description}</p>
            </div>

            <div className="mt-8 space-y-4">
              <div className="flex items-center gap-4">
                <input
                  type="number"
                  min={1}
                  max={displayStock || 1}
                  value={quantity}
                  onChange={(event) => setQuantity(Math.max(1, Number(event.target.value) || 1))}
                  className="w-28 rounded-2xl border border-border bg-white px-4 py-3 text-center outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100 font-bold"
                />
                <span className="text-sm font-semibold text-slate-500">
                  {selectedVariant ? 'Kho phiên bản:' : 'Tổng kho:'} <span className={displayStock === 0 ? 'text-red-500 font-bold' : 'text-ink font-bold'}>{displayStock}</span> sản phẩm
                </span>
              </div>

              <div className="flex flex-col gap-4 sm:flex-row">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="flex-1 inline-flex justify-center rounded-full bg-slate-900 px-6 py-3.5 font-bold text-white transition hover:bg-slate-800 shadow-sm active:scale-[0.98]"
                >
                  Thêm vào giỏ
                </button>

                <button
                  type="button"
                  onClick={(e) => handleToggleWishlist(e, product)}
                  className={`flex items-center justify-center gap-2 rounded-full border px-6 py-3.5 transition-all flex-1 font-bold ${
                    isMainProductLiked
                      ? 'bg-red-50 border-red-100 text-red-500 shadow-sm'
                      : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-white hover:text-red-500 hover:border-red-100'
                  }`}
                >
                  <span
                    className="material-symbols-outlined text-[22px]"
                    style={isMainProductLiked ? { fontVariationSettings: "'FILL' 1" } : {}}
                  >
                    favorite
                  </span>
                  <span>Yêu thích</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* USER REVIEWS SECTION */}
      <section id="review-section" className="rounded-[28px] border border-border bg-white p-6 shadow-sm space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-2xl font-bold text-ink">Đánh giá khách hàng</h2>
          <div className="flex items-center gap-4 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100">
             <div className="text-center">
                <p className="text-2xl font-bold text-ink">{ratingSummary.average.toFixed(1)}/5</p>
                <StarDisplay rating={ratingSummary.average} size={20} />
             </div>
             <div className="h-10 w-px bg-slate-200" />
             <p className="text-sm font-medium text-slate-500">Dựa trên <br/> <strong>{ratingSummary.total}</strong> lượt đánh giá</p>
          </div>
        </div>

        {/* Review Form */}
        {isAuthenticated ? (
          (myReview && !isEditingReview) ? (
            <div className="bg-sky-50/50 rounded-[24px] p-6 border border-sky-100">
              <div className="flex items-center justify-between mb-4">
                <p className="font-bold text-sky-900">Đánh giá của bạn</p>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setIsEditingReview(true)}
                    className="text-xs font-bold text-sky-600 flex items-center gap-1 hover:underline bg-white px-3 py-1.5 rounded-full shadow-sm"
                  >
                    <span className="material-symbols-outlined text-[16px]">edit</span> Chỉnh sửa
                  </button>
                  <button 
                    onClick={() => handleDeleteReview(myReview.id)}
                    className="text-xs font-bold text-red-500 flex items-center gap-1 hover:underline bg-white px-3 py-1.5 rounded-full shadow-sm"
                  >
                    <span className="material-symbols-outlined text-[16px]">delete</span> Xóa
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <StarDisplay rating={myReview.rating} size={16} />
                <span className="text-xs text-slate-400">{new Date(myReview.createdAt).toLocaleDateString('vi-VN')}</span>
              </div>
              <p className="text-sm text-slate-700 italic">"{myReview.comment}"</p>
            </div>
          ) : (
            <form onSubmit={handleSubmitReview} className="bg-slate-50 rounded-[24px] p-6 border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <p className="font-bold text-ink">{isEditingReview ? 'Cập nhật đánh giá' : 'Viết đánh giá của bạn'}</p>
              {isEditingReview && (
                <button 
                  type="button" 
                  onClick={() => {
                    setIsEditingReview(false);
                    setUserReview({ rating: myReview.rating, comment: myReview.comment });
                  }}
                  className="text-xs font-bold text-slate-500"
                >
                  Hủy bỏ
                </button>
              )}
            </div>
            
            <div className="flex items-center gap-3 mb-4">
              <span className="text-sm font-semibold text-slate-600">Chọn số sao:</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((s) => {
                  const isFilled = s <= (hoverRating || userReview.rating);
                  return (
                    <button 
                      key={s} 
                      type="button" 
                      onMouseEnter={() => setHoverRating(s)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setUserReview({...userReview, rating: s})}
                      className="text-amber-400 transition-all hover:scale-125 active:scale-90"
                      aria-label={`${s} sao`}
                    >
                      <span 
                        className={`material-icons text-[36px] ${isFilled ? 'text-amber-400' : 'text-slate-300'}`}
                      >
                        {isFilled ? 'star' : 'star_border'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
            <textarea
              value={userReview.comment}
              onChange={e => setUserReview({...userReview, comment: e.target.value})}
              placeholder="Hãy chia sẻ trải nghiệm của bạn về sản phẩm này..."
              rows={3}
              className="w-full rounded-2xl border border-slate-200 p-4 outline-none focus:border-sky-400 bg-white text-sm"
            />
            <div className="mt-4 flex justify-end">
              <button 
                type="submit" disabled={isSubmitting}
                className="rounded-full bg-slate-900 px-8 py-2.5 font-bold text-white hover:bg-slate-800 transition disabled:opacity-50"
              >
                {isSubmitting ? 'Đang xử lý...' : (isEditingReview ? 'Cập nhật' : 'Gửi đánh giá')}
              </button>
            </div>
          </form>
          )
        ) : (
          <div className="bg-slate-50 rounded-[24px] p-6 text-center border border-dashed border-slate-300">
            <p className="text-slate-600">Vui lòng <Link to={ROUTES.LOGIN} className="text-sky-600 font-bold hover:underline">Đăng nhập</Link> để viết đánh giá.</p>
          </div>
        )}

        {/* Review List */}
        <div className="space-y-6">
          {reviews.length === 0 ? (
            <p className="text-center py-10 text-slate-400">Chưa có đánh giá nào.</p>
          ) : (
            reviews.map((review) => (
              <div key={review.id} className={`flex flex-col gap-3 pb-6 border-b border-slate-100 last:border-0 ${review.hidden ? 'opacity-50' : ''}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-500 uppercase">
                      {String(review.fullName || 'U').charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-ink text-sm flex items-center gap-2">
                        {review.fullName || 'Người dùng'}
                      </p>
                      <StarDisplay rating={review.rating} size={14} />
                    </div>
                  </div>
                  <span className="text-xs text-slate-400">{new Date(review.createdAt).toLocaleDateString('vi-VN')}</span>
                </div>
                <p className="text-sm text-slate-700 leading-relaxed">{review.comment}</p>
                
                {review.reply && (
                  <div className="bg-slate-50 p-4 rounded-2xl border-l-4 border-slate-300 space-y-1">
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Phản hồi từ Synex</p>
                    <p className="text-sm text-slate-600 italic">"{review.reply}"</p>
                  </div>
                )}

                {isAdmin && (
                  <div className="flex gap-4 pt-1">
                    <button onClick={() => handleDeleteReview(review.id)} className="text-xs font-bold text-red-500 flex items-center gap-1 hover:underline">
                      <span className="material-symbols-outlined text-[16px]">delete</span> Xóa đánh giá (Admin)
                    </button>
                  </div>
                )}

                {/* Nút hành động cho chủ sở hữu bình luận trong danh sách */}
                {!isAdmin && isAuthenticated && profile && 
                  review.userId && review.userId === profile.id && (
                  <div className="flex gap-4 pt-1">
                    <button 
                      onClick={() => {
                        setIsEditingReview(true);
                        setMyReview(review);
                        setUserReview({ rating: review.rating, comment: review.comment });
                        window.scrollTo({ top: document.getElementById('review-section').offsetTop - 80, behavior: 'smooth' });
                      }} 
                      className="text-xs font-bold text-sky-600 flex items-center gap-1 hover:underline"
                    >
                      <span className="material-symbols-outlined text-[16px]">edit</span> Sửa
                    </button>
                    <button onClick={() => handleDeleteReview(review.id)} className="text-xs font-bold text-red-500 flex items-center gap-1 hover:underline">
                      <span className="material-symbols-outlined text-[16px]">delete</span> Xóa
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </section>

      {relatedProducts.length > 0 && (
        <section className="rounded-[28px] border border-border bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between gap-3">
            <h2 className="text-2xl font-bold text-ink">Sản phẩm liên quan</h2>
            <Link
              to={ROUTES.PRODUCTS}
              className="text-sm font-medium text-sky-700 hover:underline"
            >
              Xem tất cả
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {relatedProducts.map((item, index) => {
              return (
                <ProductCard
                  key={item.id || item.productId || index}
                  product={item}
                  compact
                  onNotify={(msg) => setMessage(msg)}
                />
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
}

export default ProductDetailPage