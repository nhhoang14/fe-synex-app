import { usePageTitle } from '../hooks/usePageTitle'

function AdminReviewsPage() {
  usePageTitle('Quản lý Đánh giá & Bình luận')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Quản lý Đánh giá & Bình luận</h1>
        <p className="mt-2 text-gray-600">Duyệt và ẩn đánh giá từ khách hàng, phản hồi bình luận</p>
      </div>

      {/* Review Stats */}
      <div className="grid gap-6 md:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-600">Tất Cả Đánh Giá</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">234</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-600">Chưa Duyệt</p>
          <p className="mt-2 text-3xl font-bold text-yellow-600">12</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-600">Đã Duyệt</p>
          <p className="mt-2 text-3xl font-bold text-green-600">218</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-600">Bị Ẩn</p>
          <p className="mt-2 text-3xl font-bold text-red-600">4</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <input
          type="text"
          placeholder="Tìm kiếm bình luận..."
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
        />
        <select className="rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none">
          <option>Tất cả trạng thái</option>
          <option>Chưa duyệt</option>
          <option>Đã duyệt</option>
          <option>Bị ẩn</option>
        </select>
        <select className="rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none">
          <option>Tất cả đánh giá</option>
          <option>⭐⭐⭐⭐⭐ 5 sao</option>
          <option>⭐⭐⭐⭐ 4 sao</option>
          <option>⭐⭐⭐ 3 sao</option>
        </select>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {[
          {
            customer: 'Nguyễn Văn A',
            product: 'Apple AirPods Pro',
            rating: 5,
            title: 'Sản phẩm tuyệt vời!',
            comment: 'Âm thanh rất tốt, pin lâu, đóng gói kỹ lưỡng. Rất hài lòng với mua hàng này!',
            status: 'Đã duyệt',
            date: '2 ngày trước',
          },
          {
            customer: 'Trần Thị B',
            product: 'Anker PowerBank',
            rating: 4,
            title: 'Tốt nhưng hơi nặng',
            comment: 'Dung lượng lớn, sạc nhanh nhưng hơi nặng khi mang theo.',
            status: 'Chưa duyệt',
            date: '1 giờ trước',
          },
        ].map((review, index) => (
          <div key={index} className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{review.customer}</h3>
                    <p className="text-sm text-gray-600">{review.product}</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <span
                        key={i}
                        className={`text-lg ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">({review.rating}/5)</span>
                </div>
                <h4 className="mt-3 font-medium text-gray-900">{review.title}</h4>
                <p className="mt-2 text-sm text-gray-600">{review.comment}</p>
                <p className="mt-2 text-xs text-gray-500">{review.date}</p>
              </div>
              <div className="flex flex-col gap-2">
                <span
                  className={[
                    'inline-block rounded-full px-3 py-1 text-xs font-medium whitespace-nowrap',
                    review.status === 'Đã duyệt'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800',
                  ].join(' ')}
                >
                  {review.status}
                </span>
                <div className="flex gap-2">
                  {review.status === 'Chưa duyệt' && (
                    <button className="text-green-600 hover:text-green-700 transition" title="Duyệt">
                      <span className="material-symbols-outlined text-[18px]">check_circle</span>
                    </button>
                  )}
                  <button className="text-red-600 hover:text-red-700 transition" title="Ẩn đánh giá">
                    <span className="material-symbols-outlined text-[18px]">visibility_off</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default AdminReviewsPage
