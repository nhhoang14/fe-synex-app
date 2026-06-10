import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import FormField from '../components/FormField';
import { ROUTES } from '../constants';
import { usePageTitle } from '../hooks/usePageTitle';
import { forgotPassword, resetPassword } from '../services/authService';

function ForgotPasswordPage() {
  usePageTitle('Quên mật khẩu - Synex');
  const navigate = useNavigate();

  // Quản lý tiến trình: 1 (Nhập Tên/Email) -> 2 (Nhập OTP) -> 3 (Đổi Mật Khẩu)
  const [step, setStep] = useState(1);
  
  const [form, setForm] = useState({
    identifier: '',
    otp: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  // BƯỚC 1: Gửi yêu cầu lấy OTP
  async function handleSendOtp(event) {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await forgotPassword({ identifier: form.identifier.trim() });
      setSuccessMsg('Mã xác nhận (OTP) đã được gửi đến email của bạn.');
      setStep(2); // Chuyển sang bước nhập OTP
    } catch (error) {
      setError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  // BƯỚC 2: Xác nhận UI đã nhập OTP
  function handleNextToNewPassword(event) {
    event.preventDefault();
    setError('');
    if (!form.otp.trim()) {
      setError('Vui lòng nhập mã OTP.');
      return;
    }
    setStep(3); // Chuyển sang bước đổi mật khẩu
  }

  // BƯỚC 3: Gửi OTP và Mật khẩu mới lên Backend
  async function handleResetPassword(event) {
    event.preventDefault();
    setError('');

    if (form.newPassword !== form.confirmPassword) {
      setError('Mật khẩu nhập lại không khớp!');
      return;
    }

    setIsSubmitting(true);
    try {
      await resetPassword({
        identifier: form.identifier.trim(),
        otp: form.otp.trim(),
        newPassword: form.newPassword,
      });

      alert('Đổi mật khẩu thành công! Vui lòng đăng nhập lại.');
      navigate(ROUTES.LOGIN);
    } catch (error) {
      setError(error.message);
      // Nếu API báo lỗi OTP sai, quay lại bước 2 cho người dùng nhập lại
      setStep(2); 
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-4 rounded-[28px] border border-border bg-white p-8 shadow-sm">
      <h1 className="text-4xl font-bold tracking-tight text-ink">Quên mật khẩu</h1>
      
      {successMsg && step === 2 && (
        <p className="rounded-md bg-green-50 p-3 text-sm font-medium text-green-700">
          {successMsg}
        </p>
      )}

      {/* RENDER BƯỚC 1 */}
      {step === 1 && (
        <form onSubmit={handleSendOtp} className="space-y-4">
          <p className="text-sm text-slate-600">
            Vui lòng nhập Tên đăng nhập hoặc Email của bạn. Chúng tôi sẽ gửi mã OTP qua email để đặt lại mật khẩu.
          </p>
          <FormField
            label="Tên đăng nhập hoặc Email"
            name="identifier"
            type="text"
            value={form.identifier}
            onChange={handleChange}
            required
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-full bg-slate-900 px-5 py-3 font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Đang xử lý...' : 'Gửi mã OTP'}
          </button>
        </form>
      )}

      {/* RENDER BƯỚC 2 */}
      {step === 2 && (
        <form onSubmit={handleNextToNewPassword} className="space-y-4">
          <FormField
            label="Nhập mã OTP (6 số)"
            name="otp"
            type="text"
            value={form.otp}
            onChange={handleChange}
            required
          />
          <button
            type="submit"
            className="w-full rounded-full bg-slate-900 px-5 py-3 font-semibold text-white transition hover:bg-slate-800"
          >
            Tiếp tục
          </button>
        </form>
      )}

      {/* RENDER BƯỚC 3 */}
      {step === 3 && (
        <form onSubmit={handleResetPassword} className="space-y-4">
          <FormField
            label="Mật khẩu mới"
            name="newPassword"
            type="password"
            value={form.newPassword}
            onChange={handleChange}
            required
          />
          <FormField
            label="Xác nhận mật khẩu mới"
            name="confirmPassword"
            type="password"
            value={form.confirmPassword}
            onChange={handleChange}
            required
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-full bg-slate-900 px-5 py-3 font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Đang cập nhật...' : 'Đổi mật khẩu'}
          </button>
        </form>
      )}

      {error && <p className="text-sm font-medium text-red-600">{error}</p>}

      <p className="text-center text-sm text-slate-600">
        Đã nhớ lại mật khẩu?{' '}
        <Link className="font-semibold text-sky-700 hover:underline" to={ROUTES.LOGIN}>
          Quay lại đăng nhập
        </Link>
      </p>
    </div>
  );
}

export default ForgotPasswordPage;