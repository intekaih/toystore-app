# PHẦN 2: PHÂN TÍCH YÊU CẦU

## 2.1. Quy trình thu thập yêu cầu

Việc thu thập và phân tích yêu cầu là giai đoạn quan trọng nhất trong quy trình phát triển phần mềm, quyết định đến sự thành công của dự án. Đối với hệ thống ToyStore, quy trình thu thập yêu cầu được thực hiện một cách có hệ thống và bài bản thông qua nhiều phương pháp khác nhau.

### 2.1.1. Phương pháp thu thập yêu cầu

Nhóm phát triển áp dụng bốn phương pháp chính để thu thập yêu cầu: **phỏng vấn các bên liên quan** (chủ doanh nghiệp, nhân viên, khách hàng) để hiểu rõ nhu cầu thực tế và kỳ vọng về hệ thống; **khảo sát và nghiên cứu thị trường** để nắm bắt thói quen mua sắm và phân tích các hệ thống tương tự; **phân tích tài liệu nghiệp vụ** (báo cáo bán hàng, dữ liệu khách hàng) để hiểu đặc điểm ngành hàng đồ chơi; và tổ chức **workshop và brainstorming** với đại diện các bộ phận để thảo luận tầm nhìn, ưu tiên tính năng và phát hiện yêu cầu tiềm ẩn.


**NFR-1.1: Thời gian tải trang**

Hệ thống phải đảm bảo thời gian tải trang chủ dưới ba giây trong điều kiện mạng bình thường. Các trang danh sách sản phẩm và chi tiết sản phẩm phải tải trong vòng hai giây. Để đạt được yêu cầu này, hệ thống áp dụng các kỹ thuật tối ưu: lazy loading cho hình ảnh, code splitting cho JavaScript, compression cho tài nguyên tĩnh, và caching ở nhiều tầng.

**NFR-1.2: Khả năng xử lý đồng thời**

Hệ thống phải có khả năng xử lý đồng thời ít nhất một nghìn người dùng truy cập cùng lúc mà không bị giảm hiệu suất đáng kể. Trong các đợt khuyến mãi lớn, hệ thống cần mở rộng để xử lý lên đến năm nghìn người dùng đồng thời. Kiến trúc hệ thống được thiết kế để hỗ trợ horizontal scaling, cho phép thêm server khi cần thiết.

**NFR-1.3: Thời gian phản hồi API**

Các API endpoint phải có thời gian phản hồi trung bình dưới năm trăm mili giây. Đối với các thao tác đơn giản như lấy danh sách sản phẩm, thời gian phản hồi phải dưới ba trăm mili giây. Các thao tác phức tạp như tính toán giá đơn hàng hoặc tạo đơn vận chuyển có thể có thời gian phản hồi lên đến một giây.

**NFR-1.4: Tối ưu hóa database**

Các truy vấn database phải được tối ưu hóa với việc sử dụng index phù hợp. Các truy vấn phức tạp cần được phân tích và tối ưu để đảm bảo thời gian thực thi hợp lý. Hệ thống sử dụng connection pooling để quản lý kết nối database hiệu quả.

### 2.3.2. Bảo mật (Security)

**NFR-2.1: Mã hóa mật khẩu**

Mật khẩu người dùng phải được mã hóa bằng thuật toán bcrypt với cost factor tối thiểu là mười trước khi lưu vào database. Hệ thống không bao giờ lưu trữ mật khẩu dưới dạng plain text. Khi người dùng đăng nhập, hệ thống so sánh hash của mật khẩu nhập vào với hash đã lưu.

**NFR-2.2: Xác thực và phân quyền**

Hệ thống sử dụng JWT (JSON Web Token) để xác thực người dùng. Token được ký bằng secret key và có thời gian sống hạn chế. Mỗi API endpoint được bảo vệ bằng middleware xác thực, kiểm tra tính hợp lệ của token trước khi cho phép truy cập. Hệ thống triển khai phân quyền dựa trên vai trò (RBAC - Role-Based Access Control), đảm bảo người dùng chỉ có thể thực hiện các thao tác phù hợp với vai trò của họ.

**NFR-2.3: Bảo vệ chống tấn công**

Hệ thống triển khai rate limiting để ngăn chặn các cuộc tấn công brute force và DDoS. Mỗi IP chỉ được phép thực hiện một số lượng request nhất định trong một khoảng thời gian. Hệ thống sử dụng Sequelize ORM để tự động escape các tham số truy vấn, ngăn chặn SQL injection. Tất cả input từ người dùng được validate và sanitize trước khi xử lý. Hệ thống thiết lập các HTTP security headers như Content-Security-Policy, X-Frame-Options để bảo vệ chống XSS và clickjacking.

**NFR-2.4: Bảo mật giao dịch thanh toán**

Hệ thống không lưu trữ thông tin thẻ thanh toán của người dùng. Tất cả giao dịch thanh toán được xử lý thông qua VNPay, một cổng thanh toán đã được chứng nhận PCI DSS. Thông tin giao dịch được mã hóa trong quá trình truyền tải. Hệ thống xác thực chữ ký số từ VNPay để đảm bảo tính toàn vẹn của dữ liệu giao dịch.

### 2.3.3. Khả năng sử dụng (Usability)

**NFR-3.1: Giao diện responsive**

Giao diện hệ thống phải tương thích và hiển thị tốt trên các thiết bị khác nhau: desktop, tablet và mobile. Layout tự động điều chỉnh theo kích thước màn hình. Các thao tác trên mobile được tối ưu cho cảm ứng, với kích thước nút bấm và khoảng cách phù hợp. Hình ảnh được tối ưu và load theo kích thước phù hợp với thiết bị.

**NFR-3.2: Trải nghiệm người dùng**

Giao diện phải trực quan, dễ sử dụng, với navigation rõ ràng. Người dùng mới phải có thể tìm kiếm và mua sản phẩm mà không cần hướng dẫn. Các thông báo lỗi phải rõ ràng và hướng dẫn người dùng cách khắc phục. Hệ thống cung cấp feedback tức thì cho mọi thao tác của người dùng thông qua loading indicators, success messages hoặc error messages.

**NFR-3.3: Accessibility**

Hệ thống tuân thủ các nguyên tắc accessibility cơ bản: sử dụng semantic HTML, cung cấp alt text cho hình ảnh, đảm bảo contrast ratio phù hợp cho text, hỗ trợ keyboard navigation. Điều này giúp hệ thống có thể sử dụng được bởi người khuyết tật.

**NFR-3.4: Đa ngôn ngữ**

Hệ thống hiện tại hỗ trợ tiếng Việt. Kiến trúc được thiết kế để dễ dàng mở rộng hỗ trợ thêm ngôn ngữ khác trong tương lai thông qua việc sử dụng i18n (internationalization) framework.

### 2.3.4. Độ tin cậy (Reliability)

**NFR-4.1: Uptime**

Hệ thống phải đảm bảo uptime tối thiểu chín mươi chín phẩy chín phần trăm, tương đương với thời gian downtime tối đa khoảng tám giờ bốn mươi ba phút mỗi năm. Để đạt được mục tiêu này, hệ thống cần có monitoring liên tục, alerting kịp thời khi có sự cố, và quy trình xử lý sự cố nhanh chóng.

**NFR-4.2: Backup và recovery**

Database phải được backup tự động hàng ngày. Backup được lưu trữ ở vị trí khác với server chính để đảm bảo an toàn. Hệ thống phải có khả năng khôi phục dữ liệu từ backup trong vòng hai giờ khi có sự cố. Quy trình backup và recovery phải được kiểm tra định kỳ để đảm bảo hoạt động đúng.

**NFR-4.3: Xử lý lỗi và transaction**

Hệ thống phải xử lý lỗi một cách an toàn, không để lộ thông tin nhạy cảm trong error messages. Các thao tác quan trọng như tạo đơn hàng, thanh toán phải được thực hiện trong transaction. Nếu có lỗi xảy ra, transaction phải được rollback để đảm bảo tính nhất quán của dữ liệu. Hệ thống ghi log chi tiết các lỗi để phục vụ debugging và phân tích.

**NFR-4.4: Tính nhất quán dữ liệu**

Hệ thống phải đảm bảo tính nhất quán của dữ liệu trong mọi trường hợp. Số lượng tồn kho phải được cập nhật chính xác khi có đơn hàng mới hoặc đơn hàng bị hủy. Không được phép xảy ra tình trạng bán vượt quá tồn kho. Các thao tác cập nhật dữ liệu phải sử dụng locking mechanism phù hợp để tránh race condition.

### 2.3.5. Khả năng mở rộng (Scalability)

**NFR-5.1: Mở rộng tính năng**

Kiến trúc hệ thống phải cho phép dễ dàng thêm tính năng mới mà không cần sửa đổi nhiều code hiện có. Việc áp dụng Design Patterns như Decorator và Strategy giúp hệ thống tuân thủ nguyên tắc Open/Closed Principle. Code được tổ chức theo module rõ ràng, mỗi module có trách nhiệm cụ thể, giúp việc thêm hoặc sửa đổi tính năng trở nên dễ dàng.

**NFR-5.2: Mở rộng theo chiều ngang**

Hệ thống phải hỗ trợ horizontal scaling, cho phép thêm server khi lượng người dùng tăng. Backend được thiết kế stateless, session được lưu trữ trong database hoặc Redis thay vì trong memory của server. Điều này cho phép các request từ cùng một người dùng có thể được xử lý bởi các server khác nhau.

**NFR-5.3: Tối ưu hóa tài nguyên**

Hệ thống sử dụng các tài nguyên một cách hiệu quả. Singleton Pattern được áp dụng cho các đối tượng như database connection, logger, config service để tránh tạo nhiều instance không cần thiết. Connection pooling được sử dụng để quản lý kết nối database. Caching được triển khai ở nhiều tầng để giảm tải cho database và tăng tốc độ phản hồi.

## 2.4. Yêu cầu nghiệp vụ (Domain Requirements)

Yêu cầu nghiệp vụ là các yêu cầu đặc thù của lĩnh vực kinh doanh đồ chơi và thương mại điện tử, phản ánh các quy tắc và ràng buộc nghiệp vụ cần được tuân thủ.

### 2.4.1. Quản lý tồn kho

**DR-1: Tự động trừ tồn kho**

Khi một đơn hàng được tạo và thanh toán thành công, hệ thống phải tự động trừ số lượng sản phẩm tương ứng khỏi tồn kho. Thao tác này phải được thực hiện trong transaction để đảm bảo tính nhất quán. Nếu có lỗi xảy ra trong quá trình tạo đơn hàng, số lượng tồn kho phải được rollback về trạng thái ban đầu.

**DR-2: Kiểm tra tồn kho trước khi đặt hàng**

Hệ thống phải kiểm tra số lượng tồn kho trước khi cho phép người dùng thêm sản phẩm vào giỏ hàng hoặc đặt hàng. Nếu số lượng yêu cầu vượt quá tồn kho hiện có, hệ thống phải hiển thị thông báo và không cho phép thực hiện thao tác. Trong trường hợp nhiều người dùng cùng đặt hàng một sản phẩm có số lượng tồn kho hạn chế, hệ thống sử dụng cơ chế locking để đảm bảo không bán vượt quá tồn kho.

**DR-3: Hoàn lại tồn kho khi hủy đơn**

Khi một đơn hàng bị hủy, hệ thống phải tự động hoàn lại số lượng sản phẩm vào tồn kho. Điều này đảm bảo tồn kho luôn phản ánh chính xác số lượng sản phẩm có thể bán.

### 2.4.2. Quản lý giá và khuyến mãi

**DR-4: Công thức tính giá đơn hàng**

Giá cuối cùng của đơn hàng được tính theo công thức: Tổng tiền = Tiền gốc + Tiền VAT - Tiền giảm giá + Phí vận chuyển. Trong đó, Tiền gốc là tổng giá của tất cả sản phẩm trong đơn hàng. Tiền VAT được tính bằng mười phần trăm của Tiền gốc. Tiền giảm giá là số tiền được giảm từ voucher nếu có. Phí vận chuyển phụ thuộc vào địa chỉ giao hàng và có thể được miễn phí nếu đơn hàng đạt giá trị tối thiểu.

**DR-5: Áp dụng VAT**

Thuế VAT mặc định là mười phần trăm được áp dụng cho tất cả sản phẩm. VAT được tính trên Tiền gốc trước khi áp dụng voucher. Giá trị VAT phải được lưu trữ riêng trong đơn hàng để phục vụ báo cáo thuế.

**DR-6: Miễn phí vận chuyển**

Đơn hàng có tổng giá trị (sau khi trừ voucher nhưng chưa cộng phí vận chuyển) từ năm trăm nghìn đồng trở lên được miễn phí vận chuyển. Điều kiện này được kiểm tra tự động khi tính giá đơn hàng. Thông tin về việc miễn phí vận chuyển phải được hiển thị rõ ràng cho người dùng trong quá trình đặt hàng.

### 2.4.3. Quản lý voucher

**DR-7: Giới hạn sử dụng voucher**

Mỗi voucher chỉ có thể được sử dụng một lần bởi mỗi khách hàng. Hệ thống lưu trữ lịch sử sử dụng voucher để kiểm tra. Khi khách hàng áp dụng voucher, hệ thống kiểm tra xem khách hàng đã sử dụng voucher này trước đó chưa. Nếu đã sử dụng, hệ thống từ chối và hiển thị thông báo.

**DR-8: Thời hạn voucher**

Mỗi voucher có ngày bắt đầu và ngày kết thúc hiệu lực. Voucher chỉ có thể được sử dụng trong khoảng thời gian này. Hệ thống tự động kiểm tra thời hạn khi khách hàng áp dụng voucher. Voucher hết hạn không thể được sử dụng và phải được đánh dấu rõ ràng trong giao diện.

**DR-9: Điều kiện áp dụng voucher**

Mỗi voucher có thể có điều kiện về giá trị đơn hàng tối thiểu. Ví dụ, voucher giảm một trăm nghìn đồng chỉ áp dụng cho đơn hàng từ năm trăm nghìn đồng trở lên. Hệ thống kiểm tra điều kiện này trước khi cho phép áp dụng voucher. Nếu đơn hàng không đạt điều kiện, hệ thống hiển thị thông báo rõ ràng về yêu cầu tối thiểu.

### 2.4.4. Quản lý đơn hàng và vận chuyển

**DR-10: Quy trình xử lý đơn hàng**

Đơn hàng phải tuân theo quy trình xử lý chuẩn: Chờ xử lý → Đã xác nhận → Đang đóng gói → Đang vận chuyển → Đã giao hàng. Mỗi bước chuyển đổi trạng thái phải được ghi lại với thời gian cụ thể. Chỉ admin hoặc staff mới có quyền cập nhật trạng thái đơn hàng. Khách hàng chỉ có thể hủy đơn hàng khi đơn hàng đang ở trạng thái "Chờ xử lý".

**DR-11: Tích hợp vận chuyển**

Hệ thống tích hợp với API của Giao Hàng Nhanh để tạo đơn vận chuyển tự động. Khi đơn hàng chuyển sang trạng thái "Đang vận chuyển", hệ thống tạo đơn vận chuyển trên GHN và lưu mã vận đơn. Khách hàng có thể sử dụng mã vận đơn này để tra cứu tình trạng giao hàng trên website của GHN.

## 2.5. Phi yêu cầu (Non-Requirements)

Để tập trung nguồn lực vào các tính năng cốt lõi và đảm bảo dự án hoàn thành đúng thời hạn, một số tính năng và yêu cầu đã được xác định là nằm ngoài phạm vi của phiên bản hiện tại.

**NR-1: Thanh toán khi nhận hàng (COD)**

Hệ thống hiện tại chỉ hỗ trợ thanh toán trực tuyến qua VNPay. Phương thức thanh toán khi nhận hàng (COD) không được triển khai do phức tạp trong việc quản lý dòng tiền và rủi ro về đơn hàng giả. Tính năng này có thể được xem xét trong các phiên bản tương lai khi hệ thống đã ổn định.

**NR-2: Chatbot và hỗ trợ trực tuyến**

Hệ thống không tích hợp chatbot AI hoặc live chat để hỗ trợ khách hàng trực tuyến. Khách hàng có thể liên hệ qua email hoặc số điện thoại được cung cấp. Việc tích hợp chatbot đòi hỏi đầu tư đáng kể về công nghệ và nhân lực để training và duy trì.

**NR-3: Tự vận chuyển**

Hệ thống không có đội ngũ vận chuyển riêng mà sử dụng dịch vụ của bên thứ ba (Giao Hàng Nhanh). Điều này giúp giảm chi phí vận hành và tận dụng mạng lưới vận chuyển đã có sẵn của đơn vị chuyên nghiệp.

**NR-4: Đa ngôn ngữ**

Phiên bản hiện tại chỉ hỗ trợ tiếng Việt. Hỗ trợ đa ngôn ngữ (tiếng Anh, tiếng Nhật, v.v.) không nằm trong phạm vi do thị trường mục tiêu chủ yếu là khách hàng Việt Nam. Tuy nhiên, kiến trúc hệ thống được thiết kế để dễ dàng mở rộng hỗ trợ thêm ngôn ngữ trong tương lai.

**NR-5: Ứng dụng di động native**

Hệ thống hiện tại chỉ có giao diện web responsive, không có ứng dụng di động native (iOS/Android). Giao diện web responsive đã đáp ứng tốt nhu cầu truy cập trên thiết bị di động. Việc phát triển ứng dụng native đòi hỏi nguồn lực lớn và có thể được xem xét khi có đủ ngân sách và nhu cầu từ người dùng.

**NR-6: Hệ thống đề xuất sản phẩm thông minh**

Hệ thống không triển khai thuật toán machine learning để đề xuất sản phẩm dựa trên lịch sử mua hàng và hành vi duyệt web của người dùng. Thay vào đó, hệ thống sử dụng các quy tắc đơn giản để hiển thị sản phẩm liên quan hoặc sản phẩm bán chạy. Hệ thống đề xuất thông minh đòi hỏi lượng dữ liệu lớn và chuyên môn về AI/ML.

**NR-7: Chương trình khách hàng thân thiết**

Hệ thống không có chương trình tích điểm hoặc membership cho khách hàng thân thiết. Tính năng này có thể được bổ sung trong tương lai khi cơ sở khách hàng đã đủ lớn và ổn định.

**NR-8: Tích hợp mạng xã hội**

Hệ thống không cho phép người dùng đăng nhập bằng tài khoản Facebook hoặc các mạng xã hội khác (ngoại trừ Google). Tính năng chia sẻ sản phẩm lên mạng xã hội cũng không được triển khai trong phiên bản hiện tại.
