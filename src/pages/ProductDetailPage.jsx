import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useCart } from '../contexts/CartContext'
import { usePageTitle } from '../hooks/usePageTitle'
import { getProductById, getProducts } from '../services/catalogService'
import { ROUTES } from '../constants'
import {
  formatCurrency,
  getProductId,
  getProductImage,
  getProductName,
  getProductPrice,
} from '../utils/normalizers'

function ProductDetailPage() {
  const { id } = useParams()
  const { addToCart } = useCart()

  const [product, setProduct] = useState(null)
  const [allProducts, setAllProducts] = useState([])
  const [quantity, setQuantity] = useState(1)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)

  usePageTitle(product ? `${getProductName(product)} - Synex` : 'Chi tiết sản phẩm - Synex')

  useEffect(() => {
    let mounted = true

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

  async function handleAddToCart() {
    const productId = getProductId(product)

    if (!productId) {
      setMessage('Không tìm thấy mã sản phẩm')
      return
    }

    try {
      await addToCart(productId, quantity)
      setMessage('Đã thêm vào giỏ hàng')
    } catch (error) {
      setMessage(error.message || 'Không thể thêm vào giỏ hàng')
    }
  }

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

  const productName = getProductName(product)
  const price = getProductPrice(product)
  const image = getProductImage(product)
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

  return (
    <div className="space-y-6">
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
          <div className="overflow-hidden rounded-[28px] bg-slate-50">
            <img
              src={image}
              alt={productName}
              className="aspect-[4/4] w-full object-cover"
            />
          </div>

          <div className="flex flex-col">
            <div className="mb-4 flex flex-wrap gap-2">
              <span className="rounded-full bg-sky-50 px-4 py-2 text-sm font-medium text-sky-700">
                {categoryName}
              </span>
              <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700">
                {brandName}
              </span>
            </div>

            <h1 className="text-3xl font-bold leading-tight text-ink sm:text-4xl">
              {productName}
            </h1>

            <p className="mt-4 text-3xl font-bold text-slate-900">
              {formatCurrency(price)}
            </p>

            <div className="mt-5 grid gap-3 rounded-3xl bg-slate-50 p-5 sm:grid-cols-2">
              <div>
                <p className="text-sm text-slate-500">Tình trạng</p>
                <p className="mt-1 font-semibold text-ink">
                  {product?.available === false
                    ? 'Hết hàng'
                    : stock !== null
                      ? stock > 0
                        ? `Còn ${stock} sản phẩm`
                        : 'Hết hàng'
                      : 'Còn hàng'}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-500">Mã sản phẩm</p>
                <p className="mt-1 font-semibold text-ink">{getProductId(product) || 'N/A'}</p>
              </div>
            </div>

            <div className="mt-6">
              <h2 className="text-lg font-bold text-ink">Mô tả sản phẩm</h2>
              <p className="mt-3 leading-7 text-slate-600">{description}</p>
            </div>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
              <input
                type="number"
                min={1}
                value={quantity}
                onChange={(event) => setQuantity(Math.max(1, Number(event.target.value) || 1))}
                className="w-28 rounded-2xl border border-border bg-white px-4 py-3 text-center outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
              />

              <button
                type="button"
                onClick={handleAddToCart}
                className="inline-flex justify-center rounded-full bg-slate-900 px-6 py-3 font-semibold text-white transition hover:bg-slate-800"
              >
                Thêm vào giỏ
              </button>
            </div>

            {message && <p className="mt-4 text-sm font-medium text-slate-600">{message}</p>}
          </div>
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
            {relatedProducts.map((item) => {
              const itemId = getProductId(item)
              const itemName = getProductName(item)

              return (
                <article
                  key={itemId}
                  className="overflow-hidden rounded-3xl border border-border bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-soft"
                >
                  <Link to={`/products/${itemId}`} className="block">
                    <img
                      src={getProductImage(item)}
                      alt={itemName}
                      className="aspect-[4/3] w-full object-cover"
                    />
                  </Link>

                  <div className="flex flex-col p-5">
                    <h3 className="min-h-[56px] text-lg font-bold leading-snug text-ink">
                      <Link to={`/products/${itemId}`} className="hover:text-sky-700">
                        {itemName}
                      </Link>
                    </h3>

                    <p className="mt-2 text-lg font-semibold text-slate-900">
                      {formatCurrency(getProductPrice(item))}
                    </p>

                    <Link
                      to={`/products/${itemId}`}
                      className="mt-4 inline-flex justify-center rounded-full border border-slate-200 px-4 py-2.5 font-semibold text-slate-800 transition hover:bg-slate-50"
                    >
                      Xem chi tiết
                    </Link>
                  </div>
                </article>
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
}

export default ProductDetailPage