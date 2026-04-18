import { useMemo, useState } from 'react'

const HOME_FAQS = [
	{
		question: 'Synex có giao hàng toàn quốc không?',
		answer:
			'Có. Chúng tôi giao hàng trên toàn quốc và hỗ trợ kiểm tra sản phẩm trước khi thanh toán với nhiều khu vực.',
	},
	{
		question: 'Sản phẩm có được bảo hành chính hãng không?',
		answer:
			'Tất cả sản phẩm tại Synex đều có thông tin bảo hành rõ ràng. Bạn có thể theo dõi tình trạng bảo hành ngay trong tài khoản.',
	},
	{
		question: 'Tôi có thể đổi trả trong bao lâu?',
		answer:
			'Chúng tôi hỗ trợ đổi trả theo chính sách hiện hành trong 7 ngày nếu sản phẩm lỗi nhà sản xuất hoặc giao sai model.',
	},
	{
		question: 'Synex có ưu đãi cho doanh nghiệp không?',
		answer:
			'Có. Đội ngũ B2B sẽ tư vấn cấu hình, báo giá và hỗ trợ xuất hóa đơn cho đơn hàng doanh nghiệp.',
	},
]

const CONTACT_FAQS = [
	{
		question: 'Bao lâu thì tôi nhận được phản hồi?',
		answer: 'Trong giờ hành chính, đội ngũ Synex thường phản hồi trong khoảng 30 phút.',
	},
	{
		question: 'Cần chuẩn bị gì khi bảo hành?',
		answer:
			'Bạn nên cung cấp mã đơn hàng hoặc serial sản phẩm kèm mô tả lỗi để chúng tôi xử lý nhanh hơn.',
	},
	{
		question: 'Synex có hỗ trợ tư vấn setup theo nhu cầu?',
		answer:
			'Có. Bạn có thể để lại nhu cầu sử dụng, ngân sách và thời gian triển khai để được tư vấn phù hợp.',
	},
]

function FaqSection({ variant = 'home' }) {
	const items = useMemo(
		() => (variant === 'contact' ? CONTACT_FAQS : HOME_FAQS),
		[variant],
	)
	const [openIndex, setOpenIndex] = useState(0)

	function toggleItem(index) {
		setOpenIndex((prev) => (prev === index ? -1 : index))
	}

	return (
		<section
			className="rounded-[28px] border border-border bg-white p-6 shadow-sm"
			aria-label="Frequently asked questions"
		>
			<h2 className="mb-4 text-2xl font-bold text-ink">Câu hỏi thường gặp</h2>

			<div className="space-y-3">
				{items.map((item, index) => {
					const isOpen = openIndex === index

					return (
						<article key={item.question} className="rounded-2xl border border-border bg-slate-50/80">
							<button
								type="button"
								className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left"
								onClick={() => toggleItem(index)}
								aria-expanded={isOpen}
							>
								<span className="font-medium text-ink">{item.question}</span>
								<span
									className={`grid h-8 w-8 place-items-center rounded-full bg-white text-xl font-semibold text-sky-600 shadow-sm transition-transform ${
										isOpen ? 'rotate-45' : ''
									}`}
									aria-hidden="true"
								>
									+
								</span>
							</button>

							{isOpen ? (
								<p className="px-4 pb-4 text-sm leading-7 text-muted">{item.answer}</p>
							) : null}
						</article>
					)
				})}
			</div>
		</section>
	)
}

export default FaqSection