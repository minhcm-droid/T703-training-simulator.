# Loop T-703 Start-up PFD Simulator (HD-W-7200-02-001)

Ứng dụng mô phỏng quy trình khởi động (Start-up SOP) và sơ đồ công nghệ động (P&ID/PFD) cho cụm **Hexane Stripping (Loop T-703 - Section 700, Nhà máy HDPE)**.

## Tính năng chính
- **Sơ đồ PFD/P&ID Động:** Hiệu ứng dòng chảy lưu chất (Hexane lỏng, Hơi Hexane, Hơi nước/Nước ngưng), cánh quạt bơm quay, mức bồn dâng hạ theo thời gian thực.
- **Điều khiển kiểu DCS:** Click vào van tay (`V1-V26`, `HV-713`) để Đóng/Mở, click vào bơm (`P-703`, `P-702A`, `P-705A`, `P-708A`, `P-711A`) để Start/Stop, hoặc click vào van điều khiển (`FIC`, `PIC`, `LIC`, `TIC`) để mở bảng Faceplate chỉnh `MAN/AUTO`, `SV`, `MV`.
- **Liên khóa an toàn (ESD I-705 / I-706) & Cảnh báo xâm thực (Cavitation).**
- **Tích hợp đầy đủ bảng Giới hạn vận hành an toàn (SOL) & Xử lý sự cố HAZOP.**

## Hướng dẫn chạy & Deploy lên GitHub + Vercel

### 1. Chạy thử trên máy tính
```bash
npm install
npm run dev
```
Mở trình duyệt tại `http://localhost:3000`.

### 2. Đẩy lên GitHub
```bash
git init
git add .
git commit -m "feat: complete Loop T-703 startup PFD simulator"
git branch -M main
git remote add origin https://github.com/<TEN-USER-CUA-BAN>/t703-simulator.git
git push -u origin main
```

### 3. Deploy lên Vercel
1. Truy cập [vercel.com](https://vercel.com) và đăng nhập bằng tài khoản GitHub.
2. Nhấn **Add New... -> Project**.
3. Chọn repository `t703-simulator` -> Nhấn **Deploy**.
