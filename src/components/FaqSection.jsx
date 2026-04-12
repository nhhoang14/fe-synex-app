import { useMemo, useState } from 'react'

const HOME_FAQS = [
	{
		question: 'Synex co giao hang toan quoc khong?',
		answer:
			'Co. Chung toi giao hang tren toan quoc va ho tro kiem tra san pham truoc khi thanh toan voi nhieu khu vuc.',
	},
	{
		question: 'San pham co duoc bao hanh chinh hang khong?',
		answer:
			'Tat ca san pham tai Synex deu co thong tin bao hanh ro rang. Ban co the theo doi tinh trang bao hanh ngay trong tai khoan.',
	},
	{
		question: 'Toi co the doi tra trong bao lau?',
		answer:
			'Chung toi ho tro doi tra theo chinh sach hien hanh trong 7 ngay neu san pham loi nha san xuat hoac giao sai model.',
	},
	{
		question: 'Synex co uu dai cho doanh nghiep khong?',
		answer:
			'Co. Doi ngu B2B se tu van cau hinh, bao gia va ho tro xuat hoa don cho don hang doanh nghiep.',
	},
]

const CONTACT_FAQS = [
	{
		question: 'Bao lau thi toi nhan duoc phan hoi?',
		answer: 'Trong gio hanh chinh, doi ngu Synex thuong phan hoi trong khoang 30 phut.',
	},
	{
		question: 'Can chuan bi gi khi bao hanh?',
		answer:
			'Ban nen cung cap ma don hang hoac serial san pham kem mo ta loi de chung toi xu ly nhanh hon.',
	},
	{
		question: 'Synex co ho tro tu van setup theo nhu cau?',
		answer:
			'Co. Ban co the de lai nhu cau su dung, ngan sach va thoi gian trien khai de duoc tu van phu hop.',
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
		<section className="rounded-[28px] border border-border bg-white p-6 shadow-sm" aria-label="Frequently asked questions">
			<h2 className="mb-4 text-2xl font-bold text-ink">Cau hoi thuong gap</h2>

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
									className={`grid h-8 w-8 place-items-center rounded-full bg-white text-xl font-semibold text-sky-600 shadow-sm transition-transform ${isOpen ? 'rotate-45' : ''}`}
									aria-hidden="true"
								>
									+
								</span>
							</button>

							{isOpen ? <p className="px-4 pb-4 text-sm leading-7 text-muted">{item.answer}</p> : null}
						</article>
					)
				})}
			</div>
		</section>
	)
}

export default FaqSection
