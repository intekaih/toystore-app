# PHẦN 3: MÔ HÌNH PHÁT TRIỂN PHẦN MỀM

## 3.1. Phân tích và lựa chọn mô hình

Việc lựa chọn mô hình phát triển phần mềm phù hợp là một quyết định quan trọng, ảnh hưởng trực tiếp đến hiệu quả và chất lượng của dự án. Đối với hệ thống ToyStore, sau khi phân tích kỹ lưỡng các đặc điểm của dự án và yêu cầu nghiệp vụ, nhóm phát triển đã quyết định áp dụng mô hình Agile với framework Scrum, kết hợp với các yếu tố của mô hình Iterative.

### 3.1.1. Tổng quan về mô hình Agile/Scrum

Agile là một phương pháp luận phát triển phần mềm linh hoạt, tập trung vào việc phát triển sản phẩm theo từng phần nhỏ, với chu kỳ phát triển ngắn và phản hồi liên tục từ khách hàng. Scrum là một framework cụ thể để triển khai Agile, cung cấp các quy tắc, vai trò và quy trình rõ ràng để quản lý dự án.

Trong Scrum, công việc được tổ chức thành các Sprint, mỗi Sprint là một chu kỳ phát triển kéo dài từ một đến bốn tuần. Mỗi Sprint bắt đầu bằng Sprint Planning, trong đó nhóm xác định các công việc cần hoàn thành. Trong suốt Sprint, nhóm họp Daily Standup hàng ngày để đồng bộ tiến độ. Cuối Sprint, nhóm tổ chức Sprint Review để demo sản phẩm và Sprint Retrospective để rút kinh nghiệm.

### 3.1.2. Đặc điểm của dự án ToyStore phù hợp với Agile/Scrum

**Yêu cầu có thể thay đổi**

Dự án thương mại điện tử như ToyStore thường phải đối mặt với yêu cầu thay đổi do nhiều yếu tố: xu hướng thị trường, phản hồi từ người dùng, chiến lược kinh doanh. Ví dụ, ban đầu hệ thống có thể chỉ cần chức năng thanh toán cơ bản, nhưng sau đó có thể cần thêm tích hợp với nhiều cổng thanh toán khác nhau, hoặc thêm chương trình khách hàng thân thiết. Mô hình Agile cho phép đội ngũ phát triển linh hoạt điều chỉnh kế hoạch và ưu tiên các tính năng dựa trên nhu cầu thực tế.

**Cần phản hồi nhanh từ người dùng**

Trong lĩnh vực thương mại điện tử, trải nghiệm người dùng là yếu tố quyết định sự thành công. Việc nhận phản hồi sớm và thường xuyên từ người dùng giúp đội ngũ phát triển điều chỉnh giao diện, tối ưu quy trình mua hàng, và sửa lỗi kịp thời. Với Agile, sau mỗi Sprint, một phiên bản có thể sử dụng được của sản phẩm được tạo ra, cho phép thu thập phản hồi thực tế từ người dùng thử nghiệm hoặc nhóm khách hàng beta.

**Phát triển theo từng giai đoạn**

Hệ thống ToyStore có nhiều module chức năng độc lập: quản lý sản phẩm, giỏ hàng, đặt hàng, thanh toán, quản trị. Các module này có thể được phát triển tuần tự hoặc song song trong các Sprint khác nhau. Cách tiếp cận này cho phép đưa các tính năng cốt lõi vào sử dụng sớm, trong khi các tính năng bổ sung được phát triển trong các Sprint sau.

**Quy mô nhóm phù hợp**

Scrum hoạt động hiệu quả nhất với nhóm nhỏ, từ năm đến chín người. Dự án ToyStore được phát triển bởi một nhóm ba người, phù hợp với quy mô này. Nhóm nhỏ giúp giao tiếp dễ dàng, quyết định nhanh chóng, và mỗi thành viên có thể đảm nhận nhiều vai trò.

### 3.1.3. Các vai trò trong Scrum áp dụng cho ToyStore

**Product Owner**

Vai trò này chịu trách nhiệm xác định và ưu tiên các yêu cầu trong Product Backlog. Product Owner đại diện cho khách hàng và các bên liên quan, đảm bảo nhóm phát triển luôn làm việc trên những tính năng mang lại giá trị cao nhất. Trong dự án ToyStore, Product Owner có thể là chủ doanh nghiệp hoặc một thành viên nhóm đảm nhận vai trò này.

**Scrum Master**

Scrum Master đảm bảo nhóm tuân thủ các nguyên tắc và quy trình Scrum, loại bỏ các trở ngại cản trở tiến độ của nhóm. Vai trò này không phải là quản lý truyền thống mà là người hỗ trợ, tạo điều kiện cho nhóm làm việc hiệu quả. Trong nhóm nhỏ như ToyStore, một thành viên kỹ thuật có thể kiêm nhiệm vai trò Scrum Master.

**Development Team**

Đây là nhóm các thành viên thực hiện công việc phát triển, bao gồm lập trình viên frontend, backend, và có thể cả designer. Nhóm tự tổ chức, tự quyết định cách thức thực hiện công việc để đạt được mục tiêu Sprint. Trong ToyStore, ba thành viên nhóm đều thuộc Development Team, mỗi người chịu trách nhiệm một phần của hệ thống: backend, frontend store, và frontend admin.

## 3.2. Quy trình phát triển theo Sprint

Dự án ToyStore được phát triển qua bốn Sprint chính, mỗi Sprint kéo dài hai tuần. Cách tổ chức này cho phép nhóm tập trung vào một tập hợp tính năng cụ thể, hoàn thiện và kiểm thử kỹ lưỡng trước khi chuyển sang Sprint tiếp theo.

### 3.2.1. Sprint 1: Nền tảng cơ bản (Tuần 1-2)

**Mục tiêu Sprint**

Xây dựng nền tảng cơ bản của hệ thống, bao gồm xác thực người dùng, quản lý sản phẩm cơ bản và giỏ hàng. Đây là các tính năng cốt lõi mà tất cả các tính năng khác sẽ dựa vào.

**Công việc chính**

Thiết lập cấu trúc dự án cho cả backend và frontend, bao gồm cấu hình database, thiết lập routing, và tổ chức thư mục. Triển khai hệ thống xác thực sử dụng JWT, cho phép người dùng đăng ký và đăng nhập. Xây dựng models cho các bảng chính trong database: TaiKhoan, KhachHang, SanPham, LoaiSP, ThuongHieu. Phát triển API endpoints cho quản lý sản phẩm: lấy danh sách sản phẩm, xem chi tiết sản phẩm, tìm kiếm sản phẩm. Xây dựng giao diện hiển thị danh sách sản phẩm và chi tiết sản phẩm. Triển khai chức năng giỏ hàng cơ bản: thêm sản phẩm vào giỏ, xem giỏ hàng, cập nhật số lượng, xóa sản phẩm.

**Kết quả Sprint**

Một phiên bản cơ bản của hệ thống cho phép người dùng đăng ký, đăng nhập, duyệt sản phẩm và thêm vào giỏ hàng. Phiên bản này được demo cho Product Owner và nhóm thử nghiệm nội bộ để thu thập phản hồi ban đầu.

### 3.2.2. Sprint 2: Đặt hàng và Thanh toán (Tuần 3-4)

**Mục tiêu Sprint**

Triển khai quy trình đặt hàng hoàn chỉnh và tích hợp thanh toán trực tuyến qua VNPay. Đây là tính năng quan trọng để hệ thống có thể thực sự hoạt động như một nền tảng thương mại điện tử.

**Công việc chính**

Xây dựng models và API cho đơn hàng: HoaDon, ChiTietHoaDon, DiaChiGiaoHang. Triển khai quy trình tạo đơn hàng từ giỏ hàng, bao gồm chọn địa chỉ giao hàng và xác nhận thông tin. Tích hợp VNPay payment gateway: tạo URL thanh toán, xử lý callback từ VNPay, xử lý IPN. Xây dựng logic tính giá đơn hàng, bao gồm tổng tiền sản phẩm, VAT, và phí vận chuyển. Phát triển giao diện checkout với các bước rõ ràng: xác nhận giỏ hàng, nhập địa chỉ, chọn phương thức thanh toán, xác nhận đơn hàng. Triển khai chức năng quản lý đơn hàng cho người dùng: xem lịch sử đơn hàng, xem chi tiết đơn hàng, theo dõi trạng thái.

**Kết quả Sprint**

Người dùng có thể hoàn tất quy trình mua hàng từ đầu đến cuối: thêm sản phẩm vào giỏ, đặt hàng, thanh toán qua VNPay, và nhận xác nhận đơn hàng. Hệ thống đã có thể sử dụng cho việc bán hàng thực tế, mặc dù vẫn thiếu một số tính năng quản trị.

### 3.2.3. Sprint 3: Quản trị và Tính năng nâng cao (Tuần 5-6)

**Mục tiêu Sprint**

Xây dựng giao diện quản trị cho admin và staff, cùng với các tính năng nâng cao như voucher và thống kê. Những tính năng này giúp vận hành và quản lý hệ thống hiệu quả hơn.

**Công việc chính**

Phát triển giao diện admin dashboard với các chỉ số tổng quan: doanh thu, số đơn hàng, số khách hàng mới. Xây dựng chức năng quản lý sản phẩm cho admin: thêm, sửa, xóa sản phẩm, quản lý danh mục và thương hiệu, upload hình ảnh. Triển khai quản lý đơn hàng cho admin: xem danh sách đơn hàng, lọc theo trạng thái, cập nhật trạng thái đơn hàng, tạo đơn vận chuyển GHN. Xây dựng hệ thống voucher: models Voucher và LichSuSuDungVoucher, API tạo và quản lý voucher, logic áp dụng voucher khi đặt hàng. Phát triển trang thống kê với biểu đồ: doanh thu theo thời gian, sản phẩm bán chạy, đơn hàng theo trạng thái. Triển khai chức năng quản lý người dùng: xem danh sách, vô hiệu hóa tài khoản, thay đổi vai trò.

**Kết quả Sprint**

Admin có đầy đủ công cụ để quản lý hệ thống: quản lý sản phẩm, đơn hàng, người dùng, và xem báo cáo thống kê. Hệ thống voucher cho phép tạo các chương trình khuyến mãi để thu hút khách hàng.

### 3.2.4. Sprint 4: Tối ưu hóa và Hoàn thiện (Tuần 7-8)

**Mục tiêu Sprint**

Áp dụng Design Patterns để cải thiện chất lượng code, thực hiện testing toàn diện, và chuẩn bị cho deployment. Sprint này tập trung vào chất lượng và độ ổn định của hệ thống.

**Công việc chính**

Refactoring code để áp dụng Decorator Pattern cho việc tính giá đơn hàng. Thay vì một hàm tính toán phức tạp, code được tổ chức thành các decorator: OrderPriceCalculator, VATDecorator, VoucherDecorator, ShippingDecorator. Triển khai Strategy Pattern cho chức năng lọc và sắp xếp sản phẩm. Tạo các strategy classes: NewestStrategy, PriceAscendingStrategy, PriceDescendingStrategy, BestSellerStrategy, và FilterContext để quản lý. Áp dụng Singleton Pattern cho các utility classes: DBConnection, Logger, ConfigService. Thực hiện testing: unit tests cho các hàm quan trọng, integration tests cho API endpoints, end-to-end tests cho các luồng nghiệp vụ chính. Tối ưu hiệu suất: thêm index cho database, optimize queries, implement caching nếu cần. Viết tài liệu: README, API documentation, hướng dẫn cài đặt và deployment. Chuẩn bị môi trường production: cấu hình server, thiết lập CI/CD nếu có, backup strategy.

**Kết quả Sprint**

Hệ thống đã được tối ưu hóa với code chất lượng cao, áp dụng Design Patterns một cách hiệu quả. Testing coverage đạt mức chấp nhận được. Tài liệu đầy đủ giúp dễ dàng bảo trì và mở rộng. Hệ thống sẵn sàng để triển khai lên môi trường production.

### 3.2.5. Các hoạt động Scrum trong mỗi Sprint

**Sprint Planning**

Vào đầu mỗi Sprint, nhóm họp Sprint Planning để xác định công việc cần làm. Product Owner trình bày các user stories ưu tiên cao nhất từ Product Backlog. Development Team ước lượng effort cho mỗi user story và quyết định số lượng công việc có thể hoàn thành trong Sprint. Kết quả là Sprint Backlog, danh sách các user stories và tasks cụ thể cho Sprint.

**Daily Standup**

Mỗi ngày, nhóm họp ngắn mười lăm phút để đồng bộ tiến độ. Mỗi thành viên chia sẻ ba điều: đã làm gì từ lần họp trước, sẽ làm gì tiếp theo, có trở ngại gì cần hỗ trợ. Daily Standup giúp phát hiện sớm các vấn đề và tạo cơ hội cho các thành viên hỗ trợ lẫn nhau.

**Sprint Review**

Cuối mỗi Sprint, nhóm tổ chức Sprint Review để demo sản phẩm cho Product Owner và các bên liên quan. Đây là cơ hội để thu thập phản hồi và điều chỉnh Product Backlog cho các Sprint tiếp theo. Trong ToyStore, Sprint Review thường bao gồm việc demo các tính năng mới trên môi trường staging.

**Sprint Retrospective**

Sau Sprint Review, nhóm họp Retrospective để rút kinh nghiệm. Nhóm thảo luận về những gì đã tốt, những gì cần cải thiện, và các hành động cụ thể cho Sprint tiếp theo. Retrospective giúp nhóm liên tục cải thiện quy trình làm việc.

## 3.3. So sánh với các mô hình khác

Để làm rõ lý do lựa chọn Agile/Scrum, cần so sánh với các mô hình phát triển phần mềm phổ biến khác.

### 3.3.1. Mô hình Waterfall (Thác nước)

**Đặc điểm**

Waterfall là mô hình tuần tự, trong đó các giai đoạn phát triển được thực hiện lần lượt: phân tích yêu cầu, thiết kế, triển khai, kiểm thử, triển khai, bảo trì. Mỗi giai đoạn phải hoàn thành trước khi chuyển sang giai đoạn tiếp theo. Tài liệu được tạo ra ở mỗi giai đoạn và phải được phê duyệt trước khi tiếp tục.

**Ưu điểm**

Quy trình rõ ràng, dễ hiểu và dễ quản lý. Phù hợp với dự án có yêu cầu ổn định và rõ ràng ngay từ đầu. Tài liệu đầy đủ ở mỗi giai đoạn giúp dễ dàng chuyển giao và bảo trì. Dễ ước lượng thời gian và chi phí cho toàn bộ dự án.

**Nhược điểm**

Rất khó thay đổi yêu cầu sau khi đã bắt đầu triển khai. Khách hàng chỉ thấy sản phẩm cuối cùng, không có cơ hội phản hồi sớm. Rủi ro cao nếu phát hiện lỗi thiết kế ở giai đoạn muộn. Không phù hợp với dự án có yêu cầu không rõ ràng hoặc có thể thay đổi.

**Đánh giá cho ToyStore**

Không phù hợp. Dự án thương mại điện tử thường có yêu cầu thay đổi dựa trên phản hồi người dùng và xu hướng thị trường. Việc phải chờ đến cuối dự án mới có sản phẩm hoàn chỉnh sẽ làm mất cơ hội điều chỉnh dựa trên phản hồi thực tế.

### 3.3.2. Mô hình V-Model

**Đặc điểm**

V-Model là phiên bản mở rộng của Waterfall, nhấn mạnh vào kiểm thử. Mỗi giai đoạn phát triển có một giai đoạn kiểm thử tương ứng. Ví dụ, giai đoạn thiết kế hệ thống tương ứng với kiểm thử hệ thống, giai đoạn thiết kế chi tiết tương ứng với kiểm thử tích hợp.

**Ưu điểm**

Kiểm thử được lập kế hoạch song song với phát triển, giúp phát hiện lỗi sớm hơn. Phù hợp với dự án yêu cầu độ tin cậy cao như hệ thống y tế, hàng không. Tài liệu kiểm thử rõ ràng và đầy đủ.

**Nhược điểm**

Vẫn giữ nhược điểm của Waterfall về tính cứng nhắc. Không phù hợp với dự án có yêu cầu thay đổi. Chi phí cao do phải lập kế hoạch kiểm thử chi tiết ngay từ đầu.

**Đánh giá cho ToyStore**

Không phù hợp. Mặc dù kiểm thử tốt là quan trọng, nhưng tính cứng nhắc của V-Model không phù hợp với bản chất linh hoạt của dự án thương mại điện tử.

### 3.3.3. Mô hình Spiral (Xoắn ốc)

**Đặc điểm**

Spiral kết hợp giữa Waterfall và Iterative, với trọng tâm là quản lý rủi ro. Dự án được phát triển qua nhiều vòng lặp, mỗi vòng bao gồm bốn giai đoạn: xác định mục tiêu, đánh giá và giảm thiểu rủi ro, phát triển và kiểm thử, lập kế hoạch cho vòng tiếp theo.

**Ưu điểm**

Quản lý rủi ro tốt thông qua việc đánh giá liên tục. Cho phép thay đổi yêu cầu giữa các vòng lặp. Phù hợp với dự án lớn, phức tạp và có nhiều rủi ro.

**Nhược điểm**

Phức tạp, đòi hỏi chuyên môn cao trong quản lý dự án và đánh giá rủi ro. Chi phí cao do cần nhiều thời gian cho việc đánh giá rủi ro. Khó ước lượng thời gian và chi phí tổng thể.

**Đánh giá cho ToyStore**

Có thể áp dụng nhưng quá phức tạp. Dự án ToyStore có quy mô vừa phải và rủi ro không quá cao, không cần một quy trình quản lý rủi ro phức tạp như Spiral.

### 3.3.4. Mô hình Iterative (Lặp)

**Đặc điểm**

Iterative phát triển hệ thống qua nhiều vòng lặp, mỗi vòng tạo ra một phiên bản cải tiến của sản phẩm. Mỗi iteration bao gồm các giai đoạn: phân tích, thiết kế, triển khai, kiểm thử. Khác với Waterfall, các iteration có thể quay lại và cải thiện các phần đã phát triển trước đó.

**Ưu điểm**

Cho phép phản hồi sớm và thường xuyên từ người dùng. Dễ dàng điều chỉnh và cải thiện dựa trên phản hồi. Giảm rủi ro do sản phẩm được kiểm thử liên tục. Phù hợp với dự án có yêu cầu không hoàn toàn rõ ràng ngay từ đầu.

**Nhược điểm**

Cần quản lý tốt để tránh lặp lại công việc không cần thiết. Khó ước lượng thời gian và chi phí chính xác. Đòi hỏi sự tham gia tích cực của khách hàng.

**Đánh giá cho ToyStore**

Phù hợp. Iterative có nhiều điểm tương đồng với Agile và thực tế Scrum có thể coi là một dạng của Iterative với các quy tắc và vai trò cụ thể hơn.

### 3.3.5. Bảng so sánh tổng hợp

| Tiêu chí | Waterfall | V-Model | Spiral | Agile/Scrum | Iterative |
|----------|-----------|---------|--------|-------------|-----------|
| **Tính linh hoạt** | Thấp | Thấp | Trung bình | Cao | Cao |
| **Khả năng thay đổi yêu cầu** | Rất khó | Rất khó | Khó | Dễ | Dễ |
| **Phản hồi từ khách hàng** | Cuối dự án | Cuối dự án | Sau mỗi vòng | Sau mỗi Sprint | Sau mỗi iteration |
| **Quản lý rủi ro** | Thấp | Trung bình | Cao | Trung bình | Trung bình |
| **Tài liệu** | Rất đầy đủ | Rất đầy đủ | Đầy đủ | Vừa đủ | Vừa đủ |
| **Độ phức tạp quản lý** | Thấp | Trung bình | Cao | Trung bình | Trung bình |
| **Thời gian đến sản phẩm đầu tiên** | Lâu | Lâu | Trung bình | Nhanh | Nhanh |
| **Phù hợp với dự án nhỏ/vừa** | Có | Có | Không | Có | Có |
| **Phù hợp với ToyStore** | Không | Không | Có thể | Có | Có |

## 3.4. Lý do lựa chọn Agile/Scrum cho ToyStore

Sau khi phân tích các mô hình phát triển phần mềm khác nhau, quyết định lựa chọn Agile/Scrum cho dự án ToyStore dựa trên các lý do cụ thể sau đây.

### 3.4.1. Phù hợp với bản chất của thương mại điện tử

Thương mại điện tử là lĩnh vực năng động với xu hướng và yêu cầu thay đổi nhanh chóng. Khách hàng ngày càng đòi hỏi cao về trải nghiệm mua sắm, giao diện phải thân thiện, quy trình thanh toán phải nhanh gọn. Các chương trình khuyến mãi, tính năng mới cần được triển khai linh hoạt để cạnh tranh với các đối thủ. Agile/Scrum cho phép đội ngũ phát triển nhanh chóng điều chỉnh ưu tiên, thêm tính năng mới hoặc thay đổi tính năng hiện có dựa trên phản hồi thị trường.

### 3.4.2. Tối ưu hóa giá trị kinh doanh

Với Agile/Scrum, các tính năng được ưu tiên dựa trên giá trị kinh doanh. Product Owner có thể điều chỉnh Product Backlog để đảm bảo những tính năng quan trọng nhất, mang lại doanh thu hoặc cải thiện trải nghiệm người dùng nhiều nhất được phát triển trước. Ví dụ, trong ToyStore, chức năng đặt hàng và thanh toán được ưu tiên cao hơn chức năng đánh giá sản phẩm, vì nó trực tiếp ảnh hưởng đến khả năng tạo doanh thu.

### 3.4.3. Giảm thiểu rủi ro thông qua phản hồi sớm

Thay vì chờ đến cuối dự án mới có sản phẩm hoàn chỉnh, Agile/Scrum tạo ra các phiên bản có thể sử dụng sau mỗi Sprint. Điều này cho phép thu thập phản hồi sớm từ người dùng thử nghiệm, phát hiện các vấn đề về usability, hiệu suất hoặc logic nghiệp vụ. Các vấn đề được phát hiện sớm dễ sửa hơn và ít tốn kém hơn so với việc phát hiện ở giai đoạn cuối.

### 3.4.4. Phù hợp với quy mô và kinh nghiệm của nhóm

Nhóm phát triển ToyStore gồm ba người với kinh nghiệm vừa phải về phát triển web. Scrum cung cấp một framework rõ ràng với các vai trò, quy trình và artifacts cụ thể, giúp nhóm nhỏ tổ chức công việc hiệu quả mà không cần một bộ máy quản lý phức tạp. Daily Standup giúp đồng bộ công việc, Sprint Planning giúp ước lượng và phân chia công việc hợp lý, Retrospective giúp nhóm liên tục cải thiện.

### 3.4.5. Khuyến khích cải tiến liên tục

Sprint Retrospective là cơ chế quan trọng trong Scrum để nhóm phản ánh về quy trình làm việc và tìm cách cải thiện. Trong quá trình phát triển ToyStore, nhóm đã cải thiện nhiều khía cạnh: từ cách ước lượng effort chính xác hơn, cách tổ chức code tốt hơn, đến cách review code hiệu quả hơn. Văn hóa cải tiến liên tục này không chỉ giúp dự án hiện tại thành công mà còn nâng cao năng lực của nhóm cho các dự án tương lai.

### 3.4.6. Tạo điều kiện cho việc áp dụng Design Patterns

Agile/Scrum khuyến khích refactoring và cải thiện chất lượng code liên tục. Sprint 4 của ToyStore được dành riêng cho việc tối ưu hóa và áp dụng Design Patterns. Nếu sử dụng Waterfall, việc refactoring lớn như vậy sẽ rất khó khăn vì phải thay đổi code đã được coi là hoàn thành. Với Agile, việc cải thiện code là một phần tự nhiên của quy trình, được lập kế hoạch và thực hiện một cách có hệ thống.

### 3.4.7. Tương thích với công nghệ và công cụ hiện đại

Các công nghệ được sử dụng trong ToyStore như React, Node.js, Git đều hỗ trợ tốt cho quy trình Agile. React cho phép phát triển component-based, dễ dàng thêm hoặc sửa đổi từng phần của giao diện. Git với branching strategy phù hợp cho việc nhiều người cùng làm việc trên các tính năng khác nhau. Các công cụ CI/CD hiện đại giúp tự động hóa testing và deployment, hỗ trợ việc release thường xuyên sau mỗi Sprint.

### 3.4.8. Kết luận về lựa chọn mô hình

Agile/Scrum là lựa chọn tối ưu cho dự án ToyStore vì nó cân bằng tốt giữa tính linh hoạt và tính có cấu trúc. Mô hình này cho phép đội ngũ phát triển đáp ứng nhanh với thay đổi, đồng thời vẫn duy trì quy trình làm việc rõ ràng và có thể dự đoán được. Kết quả là một hệ thống thương mại điện tử chất lượng cao, đáp ứng tốt nhu cầu người dùng và có khả năng mở rộng trong tương lai.
