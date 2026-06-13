import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ROUTES } from '../constants'
import { usePageTitle } from '../hooks/usePageTitle'
import { getProducts } from '../services/catalogService'
import { formatCurrency, getProductName, getProductPrice } from '../utils/normalizers'
import { useAuth } from '../contexts/AuthContext'

function AdminProductsPage() {
  usePageTitle('Quản lý sản phẩm - Synex')

  const { token } = useAuth()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  // --- STATE QUẢN LÝ GIAO DIỆN ---
  const [currentView, setCurrentView] = useState('list') // 'list' | 'add'
  const [editingProductId, setEditingProductId] = useState(null);

  // --- HÀM CLEAR STATE KHI THÊM SẢN PHẨM MỚI ---
  const handleAddNewClick = () => {
    setEditingProductId(null);
    setBasicInfo({ name: '', category: '', brand: '', description: '' });
    setAttributeGroups([]);
    // LUÔN khởi tạo 1 biến thể mặc định để User có chỗ nhập Giá và Kho
    setGeneratedVariants([{
      id: null,
      attributes: { 'Phiên bản': 'Mặc định' },
      sku: '',
      price: '',
      stock: '',
      imageUrl: ''
    }]);
    setImageFile(null);
    setImagePreview(null);
    setCurrentView('add');
  };
  const handleEditProduct = (product) => {
    setEditingProductId(product.id || product.productId);

    // 1. Nạp thông tin cơ bản
    setBasicInfo({
      name: product.name || '',
      category: product.category?.id || product.categoryId || '',
      brand: product.brand?.id || product.brandId || '',
      description: product.description || ''
    });

    // 2. Nạp danh sách biến thể hiện tại vào bảng
    const hasVariants = product.variants && product.variants.length > 0;
    
    if (hasVariants) {
      const loadedVariants = product.variants.map((v, index) => ({
        id: v.id,
        attributes: {
           // Đọc các thuộc tính có sẵn (theo mockup của bạn là màu sắc, kết nối)
           ...(v.color ? { 'Màu sắc': v.color } : {}),
           ...(v.connection ? { 'Kết nối': v.connection } : {})
        },
        sku: v.sku || `MS-${product.id}-V${index}`,
        price: v.price || product.price || '',
        stock: v.stockQuantity || v.stock || 0,
        imageUrl: v.imageUrl || ''
      }));
      setGeneratedVariants(loadedVariants);
    } else {
      // Nếu sản phẩm không chia biến thể, tạo 1 dòng mặc định để sửa giá/kho
      setGeneratedVariants([{
        id: product.id,
        attributes: { 'Phiên bản': 'Mặc định' },
        sku: product.sku || `MS-${product.id}`,
        price: product.price || '',
        stock: product.stockQuantity || product.stock || 0,
        imageUrl: product.imageUrl || ''
      }]);
    }

    // Làm rỗng mảng sinh tự động để tránh xung đột
    setAttributeGroups([]);
    setImagePreview(product.imageUrl || null);
    setImageFile(null); // Reset file upload
    setCurrentView('edit');
  };
  const [expandedRows, setExpandedRows] = useState(new Set()) // Lưu ID các sản phẩm đang mở rộng

  // --- STATE CHO GIAO DIỆN THÊM SẢN PHẨM ---
  const [basicInfo, setBasicInfo] = useState({ name: '', category: '', brand: '', description: '' })
  // Mảng lưu các nhóm thuộc tính (Ví dụ: [{ name: 'Màu sắc', values: 'Đen, Trắng' }])
  const [attributeGroups, setAttributeGroups] = useState([])
  // Mảng lưu danh sách biến thể được tự động sinh ra
  const [generatedVariants, setGeneratedVariants] = useState([])
  // Thêm state lưu Danh mục, Thương hiệu và Ảnh
  const [categories, setCategories] = useState([])
  const [brands, setBrands] = useState([])
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)

  // Gọi API lấy categories và brands
  async function fetchCategoriesAndBrands() {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'
      const [catRes, brandRes] = await Promise.all([
        fetch(`${API_URL}/api/admin/categories`, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
        }),
        fetch(`${API_URL}/api/admin/brands`, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
        })
      ])
      
      if (catRes.ok) {
        const data = await catRes.json()
        setCategories(Array.isArray(data) ? data : [])
      }
      if (brandRes.ok) {
        const data = await brandRes.json()
        setBrands(Array.isArray(data) ? data : [])
      }
    } catch (error) {
      console.error("Lỗi tải danh mục/thương hiệu:", error)
    }
  }

  async function fetchProductsList() {
    setLoading(true)
    try {
      const data = await getProducts()
      setProducts(Array.isArray(data) ? data : [])
    } catch {
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProductsList()
    fetchCategoriesAndBrands() // Khởi chạy tải dữ liệu
  }, [])

  async function handleDeleteProduct(id) {
    if (!window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) return
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'
      const response = await fetch(`${API_URL}/api/admin/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!response.ok) throw new Error('Xóa sản phẩm thất bại')
      
      setCurrentView('list') // Đưa về list sau khi xóa
      fetchProductsList()
    } catch (error) {
      alert(error.message)
    }
  }

  const getProductStock = (product) => {
    if (product?.variants && product.variants.length > 0) {
      return product.variants.reduce((sum, variant) => sum + Number(variant.stockQuantity || 0), 0)
    }
    return Number(product?.stockQuantity || product?.stock || 0)
  }

  const totalStock = useMemo(
    () => products.reduce((sum, product) => sum + getProductStock(product), 0),
    [products]
  )

  // --- LOGIC GIAO DIỆN: MỞ RỘNG DÒNG SẢN PHẨM ---
  const toggleExpandRow = (id) => {
    const newExpandedRows = new Set(expandedRows)
    if (newExpandedRows.has(id)) {
      newExpandedRows.delete(id)
    } else {
      newExpandedRows.add(id)
    }
    setExpandedRows(newExpandedRows)
  }

  // --- LOGIC GIAO DIỆN THÊM SP: TỰ ĐỘNG SINH BIẾN THỂ (CROSS JOIN) ---
  const handleAddAttributeGroup = () => {
    setAttributeGroups([...attributeGroups, { name: '', values: '' }])
  }

  const handleUpdateAttributeGroup = (index, field, value) => {
    const newGroups = [...attributeGroups]
    newGroups[index][field] = value
    setAttributeGroups(newGroups)
  }

  const handleRemoveAttributeGroup = (index) => {
    const newGroups = attributeGroups.filter((_, i) => i !== index)
    setAttributeGroups(newGroups)
  }

  const generateVariantsList = () => {
    const validGroups = attributeGroups.filter(g => g.name.trim() !== '' && g.values.trim() !== '');
    if (validGroups.length === 0) {
      // FIX: Khi không có nhóm thuộc tính nào, bắt buộc phải trả về 1 dòng mặc định
      setGeneratedVariants([{
        id: null,
        attributes: { 'Phiên bản': 'Mặc định' },
        sku: `MS-${basicInfo.name ? basicInfo.name.substring(0,3).toUpperCase() : 'SP'}-DF`,
        price: '',
        stock: '',
        imageUrl: ''
      }]);
      return;
    }

    const parsedGroups = validGroups.map(g => ({
      name: g.name.trim(),
      values: g.values.split(',').map(v => v.trim()).filter(v => v !== '')
    }));

    const crossJoin = (index, currentVariantInfo) => {
      if (index === parsedGroups.length) return [currentVariantInfo];
      
      let result = [];
      const currentGroup = parsedGroups[index];
      
      for (const value of currentGroup.values) {
        const newAttributes = { ...currentVariantInfo.attributes, [currentGroup.name]: value };
        const skuHint = `MS-${basicInfo.name ? basicInfo.name.substring(0,3).toUpperCase() : 'SP'}-${value.substring(0,3).toUpperCase()}`;
        
        result = result.concat(crossJoin(index + 1, {
          attributes: newAttributes,
          sku: skuHint,
          price: '',
          stock: ''
        }));
      }
      return result;
    };

    const newVariants = crossJoin(0, { attributes: {} });
    setGeneratedVariants(newVariants);
  };

  const handleVariantChange = (index, field, value) => {
    const updatedVariants = [...generatedVariants]
    updatedVariants[index][field] = value
    setGeneratedVariants(updatedVariants)
  }

  // Tự động gọi lại hàm sinh biến thể mỗi khi Nhóm thuộc tính thay đổi
  useEffect(() => {
    // CHỈ sinh tự động khi đang ở chế độ Thêm mới
    if (currentView === 'add') {
      generateVariantsList()
    }
  }, [attributeGroups])
  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  // --- TÍNH NĂNG MỚI: BẬT/TẮT, XÓA, UPLOAD ẢNH CHO TỪNG BIẾN THỂ ---
  const handleToggleVariant = (index) => {
    const updated = [...generatedVariants];
    updated[index].active = !updated[index].active;
    setGeneratedVariants(updated);
  }

  const handleDeleteVariant = (index) => {
    if (!window.confirm('Bạn có chắc muốn xóa biến thể này khỏi danh sách?')) return;
    setGeneratedVariants(generatedVariants.filter((_, i) => i !== index));
  }

  const handleVariantImageUpload = async (index, file, event) => {
    if (!file) return;
    try {
      // 1. TẢI ẢNH LÊN SERVER NGAY LẬP TỨC THEO Ý BẠN
      const formData = new FormData(); 
      formData.append('file', file); 
      formData.append('purpose', 'PRODUCT_IMAGE');
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
      
      const res = await fetch(`${API_URL}/api/uploads/images`, { 
        method: 'POST', 
        headers: { Authorization: `Bearer ${token}` }, 
        body: formData 
      });
      
      if (!res.ok) {
        const errText = await res.text();
        let errMsg = errText;
        try { 
            const errObj = JSON.parse(errText); 
            errMsg = errObj.message || errObj.error || errText; 
        } catch(e) {}
        throw new Error(errMsg || 'Lỗi máy chủ khi lưu ảnh!');
      }
      
      const data = await res.json();
      const updatedVariants = [...generatedVariants];
      
      // 2. Gán link thật trả về từ server để hiển thị UI
      updatedVariants[index].imageUrl = data.url || data.imageUrl; 
      
      // 3. VẪN NGẦM GIỮ LẠI FILE VẬT LÝ để đẩy lên FormData khi ấn "Lưu Sản Phẩm"
      updatedVariants[index].rawFile = file;
      
      setGeneratedVariants(updatedVariants);
      
    } catch (err) { 
      alert(`Backend từ chối ảnh: ${err.message}`); 
    } finally {
      if (event && event.target) event.target.value = null;
    }
  };

  async function handleSaveProduct(e) {
    e.preventDefault();
    
    try {
      const formData = new FormData();
      
      formData.append('name', basicInfo.name);
      formData.append('description', basicInfo.description);
      if (basicInfo.category) formData.append('categoryId', Number(basicInfo.category));
      if (basicInfo.brand) formData.append('brandId', Number(basicInfo.brand));
      formData.append('active', true);

      // Khớp chính xác tên 'productImages' trong ProductRequest.java
      if (imageFile) {
        formData.append('productImages', imageFile);
      }

      let activeIndex = 0;
      generatedVariants.forEach((v) => {
        if (v.active !== false) {
          // Bổ sung truyền id của variant để backend Update đúng bản ghi khi sửa
          if (v.id) formData.append(`variants[${activeIndex}].id`, v.id);

          // Khớp chính xác các tên biến trong ProductVariantRequest.java
          formData.append(`variants[${activeIndex}].sku`, (v.sku || `MS-${Date.now().toString().slice(-4)}-${activeIndex}`).trim());
          formData.append(`variants[${activeIndex}].price`, Number(v.price) || 0);
          formData.append(`variants[${activeIndex}].stock`, Number(v.stock) || 0); 
          
          if (v.rawFile) {
            formData.append(`variants[${activeIndex}].variantImage`, v.rawFile); 
          }

          // [PHẦN SỬA LỖI CHÍNH]: Đẩy mảng attributes lên Backend chuẩn cấu trúc DTO
          if (v.attributes && typeof v.attributes === 'object') {
            let attrIndex = 0;
            Object.entries(v.attributes).forEach(([attrName, attrValue]) => {
              if (attrName && attrValue) {
                // Ánh xạ vào danh sách VariantAttributeRequest trong ProductVariantRequest
                formData.append(`variants[${activeIndex}].attributes[${attrIndex}].attributeName`, attrName.trim());
                formData.append(`variants[${activeIndex}].attributes[${attrIndex}].attributeValue`, attrValue.trim());
                attrIndex++;
              }
            });
          }

          activeIndex++;
        }
      });

      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
      const url = editingProductId 
        ? `${API_URL}/api/admin/products/${editingProductId}` 
        : `${API_URL}/api/admin/products`;

      const response = await fetch(url, {
        method: editingProductId ? 'PUT' : 'POST',
        headers: {
          Authorization: `Bearer ${token}`
          // Trình duyệt tự sinh boundary cho multipart/form-data nên KHÔNG truyền Content-Type
        },
        body: formData
      });

      if (!response.ok) {
        let errorMessage = 'Lỗi lưu sản phẩm';
        try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorData.error || errorMessage;
        } catch(err) {
            errorMessage = await response.text();
        }
        throw new Error(errorMessage);
      }

      alert('Lưu sản phẩm thành công!');
      setCurrentView('list');
      fetchProductsList(); 
    } catch (error) {
      console.error('Lưu lỗi:', error);
      alert('Không thể lưu sản phẩm: ' + error.message);
    }
  }

  // ==========================================
  // RENDER: GIAO DIỆN THÊM SẢN PHẨM (UI ADMIN)
  // ==========================================
  if (currentView === 'add' || currentView === 'edit') {
    return (
      <div className="space-y-6 pb-20">
        <div className="flex items-center justify-between">
          <div>
            <button onClick={() => setCurrentView('list')} className="text-sm font-semibold text-sky-600 mb-2 flex items-center gap-1 hover:underline">
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              Quay lại danh sách
            </button>
            <h1 className="text-3xl font-bold tracking-tight text-ink">
              {currentView === 'edit' ? 'Chỉnh sửa sản phẩm' : 'Thêm mới sản phẩm'}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            {currentView === 'edit' && (
              <button 
                onClick={() => handleDeleteProduct(editingProductId)}
                className="rounded-xl bg-red-500/10 px-6 py-2.5 font-semibold text-red-500 hover:bg-red-500/20 transition"
              >
                Xóa sản phẩm
              </button>
            )}
            <button onClick={handleSaveProduct} className="rounded-xl bg-sky-600 px-6 py-2.5 font-semibold text-white hover:bg-sky-700 transition">
              Lưu sản phẩm
            </button>
          </div>
        </div>

        {/* BƯỚC 1: THÔNG TIN CƠ BẢN */}
        <section className="rounded-[24px] border border-border bg-white p-6 shadow-sm space-y-5">
          <h2 className="text-xl font-bold flex items-center gap-2 border-b pb-3">
          Thông tin cơ bản
          </h2>
          
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-slate-700">Tên sản phẩm</label>
              <input 
                type="text" placeholder="Nhập tên sản phẩm" 
                className="w-full rounded-xl border border-border p-3 outline-none focus:border-sky-500"
                value={basicInfo.name} onChange={(e) => setBasicInfo({...basicInfo, name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Danh mục</label>
              <select 
                className="w-full rounded-xl border border-border p-3 outline-none focus:border-sky-500 bg-white"
                value={basicInfo.category} onChange={(e) => setBasicInfo({...basicInfo, category: e.target.value})}
              >
                <option value="">Chọn danh mục</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name || c.categoryName}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Thương hiệu</label>
              <select 
                className="w-full rounded-xl border border-border p-3 outline-none focus:border-sky-500 bg-white"
                value={basicInfo.brand} onChange={(e) => setBasicInfo({...basicInfo, brand: e.target.value})}
              >
                <option value="">Chọn thương hiệu</option>
                {brands.map(b => <option key={b.id} value={b.id}>{b.name || b.brandName}</option>)}
              </select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-slate-700">Mô tả</label>
              <textarea 
                rows="3" placeholder="Nhập mô tả sản phẩm tại đây..." 
                className="w-full rounded-xl border border-border p-3 outline-none focus:border-sky-500"
                value={basicInfo.description} onChange={(e) => setBasicInfo({...basicInfo, description: e.target.value})}
              ></textarea>
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-slate-700">Hình ảnh chung</label>
              <label className="block border-2 border-dashed border-slate-300 rounded-xl p-8 text-center bg-slate-50 hover:bg-slate-100 cursor-pointer transition relative overflow-hidden">
                {/* FIX: Đưa thẻ input về đúng hàm của ảnh chung, xóa bỏ các biến variant/index gây lỗi crash */}
                <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                {imagePreview ? (
                   <img src={imagePreview} alt="Preview" className="absolute inset-0 w-full h-full object-contain bg-white" />
                ) : (
                  <>
                    <span className="material-symbols-outlined text-4xl text-slate-400">cloud_upload</span>
                    <p className="mt-2 text-sm text-slate-500 font-medium">Bấm để tải ảnh lên (lưu vào bảng ProductImage)</p>
                  </>
                )}
              </label>
            </div>
          </div>
        </section>

        {/* BƯỚC 2: CẤU HÌNH BIẾN THỂ & THUỘC TÍNH */}
        <section className="rounded-[24px] border border-border bg-[#0f172a] p-6 shadow-sm space-y-6 text-slate-300">
          <div className="border-b border-slate-700 pb-3">
            <h2 className="text-xl font-bold flex items-center gap-2 text-white">
            Biến thể
            </h2>
          </div>

          {/* A. Chọn các nhóm thuộc tính */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Các nhóm thuộc tính</h3>
            
            {attributeGroups.map((group, index) => (
              <div key={index} className="flex flex-wrap items-center gap-3 bg-slate-800 p-3 rounded-xl border border-slate-700">
                <span className="text-sm font-medium text-slate-400 min-w-[70px]">Nhóm {index + 1}:</span>
                <input 
                  type="text" placeholder="Tên"
                  className="bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white w-[150px] focus:border-sky-500 outline-none"
                  value={group.name} onChange={(e) => handleUpdateAttributeGroup(index, 'name', e.target.value)}
                />
                <span className="text-slate-500">→</span>
                <input 
                  type="text" placeholder="Các giá trị cách nhau bằng dấu phẩy"
                  className="bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white flex-1 min-w-[200px] focus:border-sky-500 outline-none"
                  value={group.values} onChange={(e) => handleUpdateAttributeGroup(index, 'values', e.target.value)}
                />
                <button onClick={() => handleRemoveAttributeGroup(index)} className="p-2 text-red-400 hover:bg-slate-700 rounded-lg transition">
                  <span className="material-symbols-outlined text-[20px]">delete</span>
                </button>
              </div>
            ))}

            <button 
              onClick={handleAddAttributeGroup}
              className="inline-flex items-center gap-2 text-sm font-semibold text-sky-400 bg-sky-400/10 px-4 py-2 rounded-lg hover:bg-sky-400/20 transition"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              Thêm nhóm thuộc tính
            </button>
          </div>

          {/* B. Bảng danh sách Biến thể */}
          {generatedVariants.length > 0 && (
            <div className="space-y-4 pt-6 border-t border-slate-700">
              <h3 className="text-lg font-semibold text-white">Biến thể</h3>              
              <div className="overflow-x-auto rounded-xl border border-slate-700">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-800 text-sm font-semibold text-slate-300">
                      <th className="p-4 border-b border-slate-700 w-1/5">Phiên bản</th>
                      <th className="p-4 border-b border-slate-700 w-32">SKU</th>
                      <th className="p-4 border-b border-slate-700 w-28">Giá (đ)</th>
                      <th className="p-4 border-b border-slate-700 w-20">Kho</th>
                      <th className="p-4 border-b border-slate-700 w-16 text-center">Ảnh</th>
                      <th className="p-4 border-b border-slate-700 w-28 text-center">Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700 bg-slate-900/50">
                    {generatedVariants.map((variant, index) => (
                      <tr key={index} className={`transition duration-300 ${variant.active === false ? 'opacity-40 grayscale' : 'hover:bg-slate-800/50'}`}>
                        <td className="p-4 text-sm text-sky-300 font-medium">
                          {Object.entries(variant.attributes).map(([key, val]) => (
                            <div key={key} className="mb-1">{key}: <span className="text-white">{val}</span></div>
                          ))}
                        </td>
                        <td className="p-4">
                          <input type="text" className="w-full bg-slate-800 border border-slate-600 rounded-lg px-2 py-2 text-sm text-slate-300 focus:border-sky-500 outline-none font-mono" disabled={variant.active === false} value={variant.sku} onChange={(e) => handleVariantChange(index, 'sku', e.target.value)} />
                        </td>
                        <td className="p-4">
                          <input type="number" placeholder="0" className="w-full bg-slate-800 border border-slate-600 rounded-lg px-2 py-2 text-sm text-white focus:border-sky-500 outline-none" disabled={variant.active === false} value={variant.price} onChange={(e) => handleVariantChange(index, 'price', e.target.value)} />
                        </td>
                        <td className="p-4">
                          <input type="number" placeholder="0" className="w-full bg-slate-800 border border-slate-600 rounded-lg px-2 py-2 text-sm text-white focus:border-sky-500 outline-none text-center" disabled={variant.active === false} value={variant.stock} onChange={(e) => handleVariantChange(index, 'stock', e.target.value)} />
                        </td>
                        <td className="p-4 text-center">
                          {/* --- NÚT UPLOAD ẢNH RIÊNG CHO BIẾN THỂ --- */}
                          <label className="block w-10 h-10 mx-auto border border-slate-600 border-dashed rounded cursor-pointer hover:border-sky-400 transition overflow-hidden relative bg-slate-800" title="Tải ảnh biến thể">
                            {/* FIX: Thêm tham số sự kiện 'e' vào cuối hàm handleVariantImageUpload */}
                            <input type="file" className="hidden" accept="image/*" disabled={variant.active === false} onChange={(e) => handleVariantImageUpload(index, e.target.files[0], e)} />
                            {variant.imageUrl ? (
                              <img src={variant.imageUrl} alt="variant" className="w-full h-full object-cover" />
                            ) : (
                              <span className="material-symbols-outlined text-[18px] text-slate-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">add_photo_alternate</span>
                            )}
                          </label>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-center gap-3">
                            {/* --- NÚT BẬT TẮT VÀ XÓA --- */}
                            <button onClick={() => handleToggleVariant(index)} className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${variant.active !== false ? 'bg-sky-500' : 'bg-slate-600'}`} title={variant.active !== false ? 'Tắt biến thể' : 'Bật biến thể'}>
                              <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${variant.active !== false ? 'translate-x-5' : 'translate-x-1'}`} />
                            </button>
                            <button onClick={() => handleDeleteVariant(index)} className="p-2 text-red-400 hover:bg-slate-700 rounded-lg transition" title="Xóa biến thể">
                              <span className="material-symbols-outlined text-[18px]">delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      </div>
    )
  }

  // ==========================================
  // RENDER: GIAO DIỆN DANH SÁCH (LIST VIEW)
  // ==========================================
  return (
    <div className="space-y-4">
      <section className="rounded-[28px] border border-border bg-white p-8 shadow-sm flex justify-between items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-700">
            ADMIN / PRODUCTS
          </p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight text-ink">
            Quản lý sản phẩm
          </h1>
          <p className="mt-3 max-w-2xl text-slate-700">
            Trang quản lý riêng cho sản phẩm trong khu admin. Giao diện mở rộng phân cấp biến thể.
          </p>
        </div>
        <button 
          onClick={handleAddNewClick}
          className="bg-sky-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-sky-700 transition shadow-sm"
        >
          <span className="material-symbols-outlined">add_circle</span>
          Thêm sản phẩm mới
        </button>
      </section>

      {/* ĐÃ SỬA: Bỏ đi thẻ chứa "Quay lại dashboard", đổi lưới thành 2 cột */}
      <section className="grid gap-4 md:grid-cols-2">
        <article className="rounded-3xl border border-border bg-slate-50 p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-600">Tổng sản phẩm</p>
          <strong className="mt-2 block text-3xl font-bold text-ink">
            {loading ? '...' : products.length}
          </strong>
        </article>

        <article className="rounded-3xl border border-border bg-slate-50 p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-600">Tổng tồn kho</p>
          <strong className="mt-2 block text-3xl font-bold text-ink">
            {loading ? '...' : totalStock}
          </strong>
        </article>
      </section>

      <section className="rounded-[28px] border border-border bg-[#0f172a] p-1 shadow-sm overflow-hidden">
        {/* Bản sao giao diện Dark Mode hiển thị danh sách mở rộng theo Hình 3 */}
        <div className="overflow-x-auto">
          <table className="min-w-full text-left border-collapse">
            <thead>
              <tr className="text-sm text-slate-400 border-b border-slate-700/50">
                <th className="px-4 py-4 w-12 text-center"></th>
                <th className="px-4 py-4 w-16">Ảnh</th>
                <th className="px-4 py-4">Tên Sản Phẩm / SKU</th>
                <th className="px-4 py-4">Thuộc tính</th>
                <th className="px-4 py-4">Giá</th>
                <th className="px-4 py-4">Tồn kho</th>
                <th className="px-4 py-4 text-right">Hành động</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800">
              {products.map((product, index) => {
                const stock = getProductStock(product)
                const name = getProductName(product)
                const id = product.id || product.productId
                const hasVariants = product.variants && product.variants.length > 0
                const isExpanded = expandedRows.has(id)

                return (
                  <React.Fragment key={id || `product-${index}`}>
                    {/* DÒNG SẢN PHẨM CHA */}
                    <tr className="align-middle hover:bg-white/5 transition group cursor-pointer" onClick={() => hasVariants && toggleExpandRow(id)}>
                      <td className="px-4 py-4 text-center">
                        {hasVariants && (
                          <button className={`text-slate-400 w-6 h-6 rounded bg-slate-800 flex items-center justify-center transition-transform ${isExpanded ? 'rotate-90' : ''}`}>
                            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                          </button>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <div className="w-10 h-10 bg-slate-800 rounded border border-slate-700 flex items-center justify-center overflow-hidden">
                          {product.imageUrl ? (
                            <img src={product.imageUrl} alt="img" className="w-full h-full object-cover" />
                          ) : (
                            <span className="material-symbols-outlined text-slate-500 text-[20px]">image</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-white font-semibold">
                        {name}
                      </td>
                      <td className="px-4 py-4 text-slate-500 text-sm">
                        {hasVariants ? `${product.variants.length} phiên bản` : 'Sản phẩm đơn'}
                      </td>
                      <td className="px-4 py-4 text-slate-300">
                        {formatCurrency(getProductPrice(product))}
                      </td>
                      <td className="px-4 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${stock > 10 ? 'bg-emerald-500/10 text-emerald-400' : stock > 0 ? 'bg-amber-500/10 text-amber-400' : 'bg-red-500/10 text-red-400'}`}>
                          {stock} trong kho
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right">
                         <button 
                          onClick={(e) => { e.stopPropagation(); handleEditProduct(product); }}
                          className="text-sky-400 hover:text-sky-300 font-semibold transition"
                        >
                          Sửa
                        </button>
                      </td>
                    </tr>

                    {/* DÒNG CÁC BIẾN THỂ CON (MỞ RỘNG) */}
                    {isExpanded && hasVariants && product.variants.map((variant, vIdx) => (
                      <tr key={variant.id || vIdx} className="bg-slate-900/60 align-middle">
                        <td className="px-4 py-3"></td>
                        <td className="px-4 py-3 pl-8 relative">
                          <div className="absolute left-6 top-0 bottom-0 w-px bg-slate-700"></div>
                          <div className="absolute left-6 top-1/2 w-4 h-px bg-slate-700"></div>
                          <div className="w-8 h-8 bg-slate-800 rounded border border-slate-700 flex items-center justify-center ml-4 overflow-hidden">
                            {variant.imageUrl ? (
                              <img src={variant.imageUrl} alt="img" className="w-full h-full object-cover" />
                            ) : (
                              <span className="material-symbols-outlined text-slate-500 text-[16px]">image</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-400 text-sm font-mono">
                          SKU: {variant.sku || `MS-${id}-V${vIdx}`}
                        </td>
                        <td className="px-4 py-3 text-sky-200 text-sm font-medium">
                           {/* Giả lập lấy chuỗi thuộc tính nếu Backend chưa trả sẵn thành chuỗi */}
                           {variant.color} {variant.color && variant.connection ? '/' : ''} {variant.connection}
                           {!variant.color && !variant.connection && 'Phiên bản mặc định'}
                        </td>
                        <td className="px-4 py-3 text-slate-400 text-sm">
                          {formatCurrency(variant.price || getProductPrice(product))}
                        </td>
                        <td className="px-4 py-3 text-slate-400 text-sm">
                          Kho: {variant.stockQuantity || variant.stock || 0}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {/* Đã gỡ nút Sửa ở cấp biến thể theo yêu cầu */}
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                )
              })}

              {products.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-slate-500">
                    {loading ? 'Đang tải dữ liệu...' : 'Chưa có dữ liệu sản phẩm.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

export default AdminProductsPage