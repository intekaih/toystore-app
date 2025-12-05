# PHẦN 1: GIỚI THIỆU DỰ ÁN

## 1.1. Tổng quan dự án ToyStore

Trong bối cảnh công nghệ thông tin phát triển mạnh mẽ và nhu cầu mua sắm trực tuyến ngày càng tăng cao, việc xây dựng các hệ thống thương mại điện tử đã trở thành xu hướng tất yếu của nhiều doanh nghiệp. ToyStore là một hệ thống thương mại điện tử được phát triển nhằm đáp ứng nhu cầu mua bán đồ chơi trực tuyến, cung cấp một nền tảng thuận tiện cho cả người bán và người mua.

### 1.1.1. Mô tả hệ thống

ToyStore là hệ thống thương mại điện tử chuyên về lĩnh vực kinh doanh đồ chơi trẻ em. Hệ thống được thiết kế để phục vụ ba nhóm đối tượng chính: khách hàng (người mua hàng), quản trị viên (admin) và nhân viên (staff). Mỗi nhóm đối tượng có các chức năng và quyền hạn riêng biệt, phù hợp với vai trò của họ trong hệ thống.

Hệ thống ToyStore cung cấp đầy đủ các tính năng cơ bản của một nền tảng thương mại điện tử hiện đại, bao gồm: quản lý sản phẩm, giỏ hàng, đặt hàng, thanh toán trực tuyến, theo dõi đơn hàng và đánh giá sản phẩm. Đặc biệt, hệ thống tích hợp với các dịch vụ bên thứ ba như cổng thanh toán VNPay và dịch vụ vận chuyển Giao Hàng Nhanh (GHN), giúp tối ưu hóa trải nghiệm người dùng và quy trình vận hành.

### 1.1.2. Kiến trúc hệ thống

ToyStore được xây dựng dựa trên kiến trúc ba tầng (3-Tier Architecture), một mô hình kiến trúc phổ biến trong phát triển phần mềm hiện đại. Kiến trúc này bao gồm ba tầng chính:

**Tầng trình diễn (Presentation Tier)**: Đây là tầng giao diện người dùng, được phát triển bằng React.js kết hợp với Tailwind CSS. Tầng này chịu trách nhiệm hiển thị thông tin và tương tác với người dùng thông qua giao diện web. React.js cung cấp khả năng xây dựng giao diện động, phản hồi nhanh và trải nghiệm người dùng mượt mà.

**Tầng logic nghiệp vụ (Business Logic Tier)**: Tầng này được xây dựng bằng Node.js và Express.js, đóng vai trò là trung tâm xử lý logic nghiệp vụ của hệ thống. Tầng này chứa các controllers xử lý các yêu cầu HTTP, các services thực hiện logic nghiệp vụ phức tạp, và các middlewares để xác thực, phân quyền và xử lý lỗi. Đặc biệt, tầng này triển khai các Design Patterns như Decorator, Strategy và Singleton để tối ưu hóa cấu trúc code và khả năng mở rộng.

**Tầng dữ liệu (Data Tier)**: Tầng này sử dụng SQL Server làm hệ quản trị cơ sở dữ liệu, kết hợp với Sequelize ORM để tương tác với database. Sequelize giúp đơn giản hóa các thao tác với cơ sở dữ liệu, đồng thời cung cấp các tính năng bảo mật như phòng chống SQL injection.

### 1.1.3. Đối tượng sử dụng

Hệ thống ToyStore phục vụ ba nhóm đối tượng chính với các chức năng và quyền hạn khác nhau:

**Khách hàng (Customer)**: Đây là nhóm người dùng cuối, bao gồm cả khách hàng đã đăng ký tài khoản và khách vãng lai. Khách hàng có thể duyệt và tìm kiếm sản phẩm, thêm sản phẩm vào giỏ hàng, đặt hàng, thanh toán trực tuyến, theo dõi trạng thái đơn hàng và đánh giá sản phẩm đã mua. Đối với khách hàng đã đăng ký, hệ thống lưu trữ lịch sử mua hàng và thông tin cá nhân để phục vụ cho các lần mua hàng tiếp theo.

**Quản trị viên (Admin)**: Nhóm này có quyền quản lý toàn bộ hệ thống, bao gồm quản lý sản phẩm (thêm, sửa, xóa), quản lý danh mục và thương hiệu, quản lý đơn hàng, quản lý người dùng, quản lý voucher khuyến mãi, và xem các báo cáo thống kê về doanh thu, sản phẩm bán chạy. Admin có toàn quyền kiểm soát và điều hành hoạt động của hệ thống.

**Nhân viên (Staff)**: Nhóm này có quyền hạn trung gian, chủ yếu tập trung vào xử lý đơn hàng và hỗ trợ khách hàng. Nhân viên có thể xem và cập nhật trạng thái đơn hàng, xử lý các yêu cầu hủy đơn, và hỗ trợ khách hàng trong quá trình mua hàng.

### 1.1.4. Công nghệ sử dụng

Dự án ToyStore sử dụng các công nghệ hiện đại và phổ biến trong phát triển web:

**Frontend**: React.js (thư viện JavaScript), Tailwind CSS (framework CSS), Axios (thư viện HTTP client), React Router (quản lý routing)

**Backend**: Node.js (runtime environment), Express.js (web framework), Sequelize (ORM), Passport.js (authentication), JWT (JSON Web Token)

**Database**: SQL Server 2019

**Tích hợp bên ngoài**: VNPay Payment Gateway (thanh toán trực tuyến), Giao Hàng Nhanh API (vận chuyển)

**Công cụ phát triển**: Git (version control), npm (package manager), Docker (containerization)

## 1.2. Lý do chọn dự án

Việc lựa chọn dự án ToyStore làm đối tượng nghiên cứu cho tiểu luận Phân tích và Thiết kế Phần mềm dựa trên nhiều lý do quan trọng sau đây:

### 1.2.1. Dự án thực tế và đã triển khai

ToyStore không phải là một dự án mô phỏng hay học thuật đơn thuần, mà là một hệ thống thương mại điện tử thực tế đã được phát triển và triển khai hoàn chỉnh. Điều này mang lại nhiều lợi ích cho việc nghiên cứu và phân tích. Thứ nhất, dự án phải đối mặt với các yêu cầu thực tế từ người dùng, không chỉ là các yêu cầu lý thuyết. Thứ hai, hệ thống phải xử lý các tình huống phức tạp trong môi trường production như xử lý đồng thời nhiều người dùng, đảm bảo tính nhất quán của dữ liệu, và xử lý lỗi một cách an toàn. Thứ ba, việc nghiên cứu một dự án thực tế giúp hiểu rõ hơn về quy trình phát triển phần mềm từ giai đoạn phân tích yêu cầu đến triển khai và bảo trì.

### 1.2.2. Áp dụng nhiều Design Patterns

Một trong những điểm nổi bật của dự án ToyStore là việc áp dụng có hệ thống các Design Patterns trong quá trình phát triển. Cụ thể, dự án triển khai ba Design Patterns quan trọng:

**Decorator Pattern** được sử dụng để tính toán giá đơn hàng một cách linh hoạt và có thể mở rộng. Thay vì sử dụng một hàm tính toán phức tạp với nhiều điều kiện, hệ thống sử dụng chuỗi các decorators để thêm dần các thành phần giá như VAT, voucher giảm giá và phí vận chuyển. Cách tiếp cận này tuân thủ nguyên tắc Open/Closed Principle, cho phép thêm các thành phần giá mới mà không cần sửa đổi code hiện có.

**Strategy Pattern** được áp dụng cho chức năng lọc và sắp xếp sản phẩm. Thay vì sử dụng các câu lệnh if-else hoặc switch-case dài dòng, hệ thống định nghĩa các strategy riêng biệt cho từng cách sắp xếp (mới nhất, giá tăng dần, giá giảm dần, bán chạy nhất). Điều này giúp code dễ đọc, dễ bảo trì và dễ dàng mở rộng khi cần thêm các cách sắp xếp mới.

**Singleton Pattern** được sử dụng để quản lý các tài nguyên quan trọng như kết nối database, logger và configuration service. Việc đảm bảo chỉ có một instance duy nhất của các đối tượng này giúp tiết kiệm tài nguyên hệ thống và đảm bảo tính nhất quán trong toàn bộ ứng dụng.

Việc áp dụng các Design Patterns này không chỉ cải thiện chất lượng code mà còn cung cấp cơ hội tốt để nghiên cứu và đánh giá hiệu quả của các mẫu thiết kế trong thực tế.

### 1.2.3. Kiến trúc rõ ràng và có tổ chức

Dự án ToyStore được xây dựng dựa trên kiến trúc 3-tier, một mô hình kiến trúc được chứng minh là hiệu quả và phổ biến trong phát triển ứng dụng web. Kiến trúc này tách biệt rõ ràng ba tầng: giao diện người dùng, logic nghiệp vụ và dữ liệu. Sự tách biệt này mang lại nhiều lợi ích như dễ bảo trì, dễ mở rộng, và cho phép phát triển song song các tầng khác nhau.

Bên cạnh đó, cấu trúc thư mục của dự án được tổ chức một cách khoa học và tuân thủ các best practices trong cộng đồng phát triển phần mềm. Backend được chia thành các thư mục rõ ràng: models (định nghĩa cấu trúc dữ liệu), controllers (xử lý HTTP requests), services (logic nghiệp vụ), middlewares (xử lý trung gian), routes (định nghĩa API endpoints), và utils (các tiện ích dùng chung). Frontend cũng được tổ chức tương tự với components, pages, services và contexts. Cấu trúc rõ ràng này giúp dễ dàng tìm kiếm và hiểu code, đồng thời tạo điều kiện thuận lợi cho việc phân tích và nghiên cứu.

### 1.2.4. Tài liệu kỹ thuật đầy đủ

Dự án ToyStore được đi kèm với tài liệu kỹ thuật chi tiết và đầy đủ, bao gồm:

- Tài liệu hướng dẫn cài đặt và cấu hình hệ thống
- Tài liệu giải thích chi tiết về từng Design Pattern được sử dụng
- Tài liệu API endpoints với mô tả đầy vào và đầu ra
- Tài liệu về cấu trúc database và các quan hệ giữa các bảng
- Comments trong code giải thích các phần logic phức tạp

Việc có tài liệu đầy đủ giúp quá trình nghiên cứu và phân tích trở nên dễ dàng hơn, đồng thời cung cấp cái nhìn toàn diện về các quyết định thiết kế và lý do đằng sau chúng.

### 1.2.5. Phù hợp với nội dung môn học

Dự án ToyStore bao phủ hầu hết các nội dung quan trọng trong môn Phân tích và Thiết kế Phần mềm, bao gồm:

- Phân tích yêu cầu hệ thống (functional và non-functional requirements)
- Lựa chọn mô hình phát triển phần mềm (Agile/Scrum)
- Thiết kế kiến trúc hệ thống (3-tier architecture)
- Thiết kế cơ sở dữ liệu (ERD, normalization)
- Áp dụng Design Patterns
- Thiết kế API (RESTful)
- Bảo mật và xác thực (JWT, bcrypt)

Sự phù hợp này giúp tiểu luận có thể minh họa cụ thể và sinh động các khái niệm lý thuyết đã học trong môn học.

## 1.3. Mục tiêu và phạm vi tiểu luận

### 1.3.1. Mục tiêu nghiên cứu

Tiểu luận này được thực hiện với các mục tiêu chính sau đây:

**Mục tiêu 1: Phân tích quy trình phát triển phần mềm**

Nghiên cứu và trình bày chi tiết quy trình phát triển hệ thống ToyStore từ giai đoạn thu thập yêu cầu, phân tích, thiết kế, triển khai đến kiểm thử và bảo trì. Phân tích lý do lựa chọn mô hình Agile/Scrum và đánh giá hiệu quả của mô hình này trong bối cảnh dự án thương mại điện tử.

**Mục tiêu 2: Trình bày thiết kế kiến trúc và chi tiết hệ thống**

Mô tả và giải thích kiến trúc 3-tier của hệ thống, bao gồm các thành phần chính và cách chúng tương tác với nhau. Trình bày thiết kế chi tiết của cơ sở dữ liệu, API, giao diện người dùng và các module quan trọng. Sử dụng các biểu đồ UML (Use Case, Class, Sequence, Activity, Component) để minh họa rõ ràng các khía cạnh khác nhau của hệ thống.

**Mục tiêu 3: Đánh giá hiệu quả của Design Patterns**

Phân tích cách thức áp dụng ba Design Patterns (Decorator, Strategy, Singleton) trong dự án ToyStore. So sánh giải pháp sử dụng Design Patterns với các cách tiếp cận truyền thống để làm rõ lợi ích về mặt cấu trúc code, khả năng bảo trì và mở rộng. Đánh giá mức độ phù hợp của từng pattern với bài toán cụ thể.

**Mục tiêu 4: Rút ra bài học kinh nghiệm**

Tổng hợp các bài học kinh nghiệm từ quá trình phân tích và nghiên cứu dự án, bao gồm các quyết định thiết kế đúng đắn, các vấn đề gặp phải và cách giải quyết, cũng như các đề xuất cải tiến cho tương lai.

### 1.3.2. Phạm vi nghiên cứu

Để đảm bảo tính tập trung và chiều sâu của nghiên cứu, tiểu luận này giới hạn phạm vi trong các khía cạnh sau:

**Về mặt chức năng**: Tiểu luận tập trung phân tích các chức năng cốt lõi của hệ thống bao gồm quản lý sản phẩm, giỏ hàng, đặt hàng, thanh toán và quản trị. Các chức năng phụ như quản lý banner, đánh giá sản phẩm sẽ được đề cập ngắn gọn.

**Về mặt kỹ thuật**: Nghiên cứu tập trung vào kiến trúc hệ thống, thiết kế cơ sở dữ liệu, thiết kế API và đặc biệt là việc áp dụng Design Patterns. Các khía cạnh như deployment, monitoring, và performance optimization sẽ không được đi sâu.

**Về mặt thời gian**: Tiểu luận phân tích hệ thống tại thời điểm hiện tại (phiên bản 2.0.0), không đi sâu vào lịch sử phát triển hoặc các phiên bản trước đó.

**Về mặt công nghệ**: Nghiên cứu tập trung vào các công nghệ chính được sử dụng (React.js, Node.js, Express.js, SQL Server) và các Design Patterns. Các thư viện và công cụ hỗ trợ sẽ được đề cập khi cần thiết.

### 1.3.3. Cấu trúc tiểu luận

Tiểu luận được tổ chức thành bảy phần chính:

**Phần 1 - Giới thiệu dự án**: Trình bày tổng quan về hệ thống ToyStore, lý do chọn dự án và mục tiêu nghiên cứu.

**Phần 2 - Phân tích yêu cầu**: Phân tích chi tiết các yêu cầu chức năng, phi chức năng và yêu cầu nghiệp vụ của hệ thống.

**Phần 3 - Mô hình phát triển phần mềm**: Trình bày mô hình Agile/Scrum được áp dụng, quy trình phát triển theo sprint và so sánh với các mô hình khác.

**Phần 4 - Thiết kế kiến trúc hệ thống**: Mô tả kiến trúc 3-tier, các thành phần chính và luồng dữ liệu trong hệ thống.

**Phần 5 - Thiết kế chi tiết**: Trình bày thiết kế cơ sở dữ liệu, giao diện người dùng, API và đặc biệt là việc áp dụng Design Patterns.

**Phần 6 - UML Diagrams**: Sử dụng các biểu đồ UML để minh họa các khía cạnh khác nhau của hệ thống.

**Phần 7 - Đánh giá và kết luận**: Đánh giá tổng thể quá trình phân tích và thiết kế, rút ra bài học kinh nghiệm và đề xuất hướng phát triển tương lai.

### 1.3.4. Ý nghĩa của nghiên cứu

Tiểu luận này mang lại nhiều ý nghĩa quan trọng:

**Về mặt học thuật**: Cung cấp một ví dụ cụ thể và chi tiết về cách áp dụng các kiến thức lý thuyết trong môn Phân tích và Thiết kế Phần mềm vào thực tế. Minh họa rõ ràng cách thức sử dụng các Design Patterns để giải quyết các vấn đề thực tế trong phát triển phần mềm.

**Về mặt thực tiễn**: Cung cấp tài liệu tham khảo hữu ích cho các nhà phát triển muốn xây dựng hệ thống thương mại điện tử tương tự. Chia sẻ kinh nghiệm và bài học từ một dự án thực tế, giúp tránh các sai lầm phổ biến và áp dụng các best practices.

**Về mặt cá nhân**: Củng cố và nâng cao kiến thức về phân tích và thiết kế phần mềm thông qua việc nghiên cứu sâu một dự án thực tế. Phát triển kỹ năng phân tích hệ thống, đọc hiểu code và viết tài liệu kỹ thuật.

# PHẦN 2: PHÂN TÍCH YÊU CẦU

## 2.1. Quy trình thu thập yêu cầu

Việc thu thập và phân tích yêu cầu là giai đoạn quan trọng nhất trong quy trình phát triển phần mềm, quyết định đến sự thành công của dự án. Đối với hệ thống ToyStore, quy trình thu thập yêu cầu được thực hiện một cách có hệ thống và bài bản thông qua nhiều phương pháp khác nhau.

### 2.1.1. Phương pháp thu thập yêu cầu

**Phỏng vấn các bên liên quan**

Phương pháp phỏng vấn được sử dụng để thu thập thông tin trực tiếp từ các bên liên quan, bao gồm chủ doanh nghiệp, nhân viên bán hàng và khách hàng tiềm năng. Thông qua các cuộc phỏng vấn, nhóm phát triển có thể hiểu rõ nhu cầu thực tế, các vấn đề đang gặp phải trong quy trình bán hàng truyền thống, và kỳ vọng về hệ thống mới. Các câu hỏi được thiết kế để khai thác thông tin về quy trình nghiệp vụ hiện tại, các điểm nghẽn, và các tính năng mong muốn.

**Khảo sát và nghiên cứu thị trường**

Nhóm phát triển tiến hành khảo sát trực tuyến với nhóm khách hàng mục tiêu để hiểu rõ thói quen mua sắm, các tính năng họ mong đợi ở một trang thương mại điện tử bán đồ chơi, và các yếu tố ảnh hưởng đến quyết định mua hàng. Đồng thời, nghiên cứu các hệ thống thương mại điện tử tương tự trên thị trường để xác định các tính năng chuẩn mực và các điểm khác biệt có thể tạo ra lợi thế cạnh tranh.

**Phân tích tài liệu nghiệp vụ**

Các tài liệu liên quan đến quy trình kinh doanh hiện tại, báo cáo bán hàng, và dữ liệu khách hàng được phân tích để hiểu rõ đặc điểm của ngành hàng đồ chơi, xu hướng mua sắm theo mùa, và các yêu cầu đặc thù của lĩnh vực này.

**Workshop và brainstorming**

Các buổi workshop với sự tham gia của đại diện từ các bộ phận khác nhau được tổ chức để thảo luận về tầm nhìn của hệ thống, các tính năng ưu tiên, và các ràng buộc về mặt kỹ thuật và kinh doanh. Phương pháp brainstorming giúp phát hiện các yêu cầu tiềm ẩn và tạo ra sự đồng thuận giữa các bên liên quan.

### 2.1.2. Phân loại và ưu tiên hóa yêu cầu

Sau khi thu thập, các yêu cầu được phân loại thành ba nhóm chính: yêu cầu chức năng, yêu cầu phi chức năng và yêu cầu nghiệp vụ. Mỗi yêu cầu được đánh giá theo các tiêu chí: tầm quan trọng đối với nghiệp vụ, tính khả thi về mặt kỹ thuật, và mức độ ưu tiên triển khai. Phương pháp MoSCoW (Must have, Should have, Could have, Won't have) được áp dụng để xác định mức độ ưu tiên của từng yêu cầu, giúp đội ngũ phát triển tập trung vào các tính năng cốt lõi trong các sprint đầu tiên.

### 2.1.3. Xác thực và phê duyệt yêu cầu

Tài liệu đặc tả yêu cầu được soạn thảo và trình bày cho các bên liên quan để xác nhận tính chính xác và đầy đủ. Quá trình xác thực bao gồm việc review chi tiết từng yêu cầu, kiểm tra tính nhất quán giữa các yêu cầu, và đảm bảo không có mâu thuẫn hoặc thiếu sót. Sau khi được điều chỉnh dựa trên phản hồi, tài liệu yêu cầu được phê duyệt chính thức và trở thành cơ sở cho các giai đoạn thiết kế và triển khai.

## 2.2. Yêu cầu chức năng (Functional Requirements)

Yêu cầu chức năng mô tả các chức năng cụ thể mà hệ thống phải cung cấp để đáp ứng nhu cầu của người dùng. Các yêu cầu này được tổ chức theo từng module chức năng chính của hệ thống ToyStore.

### 2.2.1. Quản lý người dùng

**FR-1.1: Đăng ký tài khoản**

Hệ thống cho phép người dùng mới đăng ký tài khoản bằng cách cung cấp các thông tin cơ bản: họ tên, email, số điện thoại và mật khẩu. Email phải là duy nhất trong hệ thống và được xác thực thông qua một liên kết gửi đến hộp thư của người dùng. Mật khẩu phải đáp ứng các yêu cầu về độ mạnh: tối thiểu tám ký tự, bao gồm chữ hoa, chữ thường và số. Sau khi đăng ký thành công, hệ thống tự động tạo một giỏ hàng riêng cho người dùng.

**FR-1.2: Đăng nhập và xác thực**

Người dùng đăng nhập vào hệ thống bằng email và mật khẩu. Hệ thống sử dụng JWT (JSON Web Token) để xác thực và duy trì phiên làm việc. Token có thời gian sống hạn chế và được lưu trữ an toàn trên client. Hệ thống hỗ trợ chức năng "Ghi nhớ đăng nhập" để tăng tiện lợi cho người dùng thường xuyên. Ngoài ra, hệ thống tích hợp đăng nhập thông qua Google OAuth để người dùng có thể đăng nhập nhanh chóng bằng tài khoản Google của họ.

**FR-1.3: Quản lý thông tin cá nhân**

Người dùng có thể xem và cập nhật thông tin cá nhân bao gồm: họ tên, số điện thoại, ngày sinh và giới tính. Hệ thống cho phép người dùng thay đổi mật khẩu bằng cách xác nhận mật khẩu cũ và nhập mật khẩu mới. Chức năng quên mật khẩu cho phép người dùng đặt lại mật khẩu thông qua email xác thực.

**FR-1.4: Quản lý địa chỉ giao hàng**

Người dùng có thể lưu trữ nhiều địa chỉ giao hàng khác nhau, mỗi địa chỉ bao gồm: tên người nhận, số điện thoại, địa chỉ chi tiết (số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố). Người dùng có thể đánh dấu một địa chỉ làm địa chỉ mặc định, địa chỉ này sẽ được tự động chọn khi đặt hàng. Hệ thống cho phép thêm, sửa và xóa địa chỉ giao hàng.

**FR-1.5: Xem lịch sử đơn hàng**

Người dùng có thể xem danh sách tất cả các đơn hàng đã đặt, bao gồm thông tin: mã đơn hàng, ngày đặt, tổng tiền, trạng thái đơn hàng. Người dùng có thể xem chi tiết từng đơn hàng với thông tin đầy đủ về sản phẩm, số lượng, giá, địa chỉ giao hàng và lịch sử thay đổi trạng thái. Hệ thống cung cấp chức năng lọc và tìm kiếm đơn hàng theo trạng thái hoặc khoảng thời gian.

### 2.2.2. Quản lý sản phẩm

**FR-2.1: Xem danh sách sản phẩm**

Hệ thống hiển thị danh sách sản phẩm dưới dạng lưới với thông tin cơ bản: hình ảnh, tên sản phẩm, giá, và đánh giá trung bình. Danh sách hỗ trợ phân trang để tối ưu hiệu suất khi có nhiều sản phẩm. Người dùng có thể điều chỉnh số lượng sản phẩm hiển thị trên mỗi trang. Hệ thống hiển thị nhãn đặc biệt cho các sản phẩm mới, sản phẩm bán chạy hoặc sản phẩm đang giảm giá.

**FR-2.2: Tìm kiếm sản phẩm**

Người dùng có thể tìm kiếm sản phẩm bằng cách nhập từ khóa vào ô tìm kiếm. Hệ thống tìm kiếm trong tên sản phẩm, mô tả và các thuộc tính khác. Kết quả tìm kiếm được hiển thị theo mức độ liên quan, với các sản phẩm khớp chính xác được ưu tiên hiển thị trước. Hệ thống hỗ trợ tìm kiếm mờ (fuzzy search) để xử lý các trường hợp người dùng nhập sai chính tả.

**FR-2.3: Lọc và sắp xếp sản phẩm**

Hệ thống cung cấp nhiều tiêu chí lọc sản phẩm: theo danh mục, theo thương hiệu, theo khoảng giá, theo độ tuổi phù hợp. Người dùng có thể kết hợp nhiều tiêu chí lọc cùng lúc. Hệ thống áp dụng Strategy Pattern để triển khai các chiến lược sắp xếp khác nhau: sản phẩm mới nhất, giá tăng dần, giá giảm dần, bán chạy nhất, đánh giá cao nhất. Việc thay đổi tiêu chí lọc hoặc sắp xếp được thực hiện mượt mà mà không cần tải lại toàn bộ trang.

**FR-2.4: Xem chi tiết sản phẩm**

Trang chi tiết sản phẩm hiển thị đầy đủ thông tin: tên sản phẩm, giá, mô tả chi tiết, thông số kỹ thuật, hình ảnh (hỗ trợ xem nhiều ảnh và phóng to), danh mục, thương hiệu, độ tuổi phù hợp, số lượng tồn kho. Hệ thống hiển thị các sản phẩm liên quan hoặc sản phẩm thường được mua cùng để khuyến khích mua thêm. Người dùng có thể thêm sản phẩm vào giỏ hàng trực tiếp từ trang chi tiết.

**FR-2.5: Đánh giá và nhận xét sản phẩm**

Người dùng đã mua sản phẩm có thể đánh giá bằng cách cho điểm từ một đến năm sao và viết nhận xét. Mỗi người dùng chỉ được đánh giá một lần cho mỗi sản phẩm. Hệ thống tính toán và hiển thị điểm đánh giá trung bình cùng với tổng số lượt đánh giá. Các đánh giá được hiển thị theo thứ tự mới nhất hoặc hữu ích nhất. Người dùng khác có thể đánh dấu một đánh giá là hữu ích.

### 2.2.3. Quản lý giỏ hàng

**FR-3.1: Thêm sản phẩm vào giỏ hàng**

Người dùng có thể thêm sản phẩm vào giỏ hàng từ trang danh sách sản phẩm hoặc trang chi tiết sản phẩm. Khi thêm sản phẩm, người dùng chọn số lượng mong muốn. Hệ thống kiểm tra số lượng tồn kho và chỉ cho phép thêm nếu còn đủ hàng. Nếu sản phẩm đã có trong giỏ hàng, hệ thống tăng số lượng thay vì tạo mục mới. Sau khi thêm thành công, hệ thống hiển thị thông báo và cập nhật số lượng sản phẩm trong icon giỏ hàng.

**FR-3.2: Xem giỏ hàng**

Trang giỏ hàng hiển thị danh sách tất cả sản phẩm đã thêm với thông tin: hình ảnh, tên, giá đơn vị, số lượng, thành tiền. Hệ thống tính toán và hiển thị tổng tiền tạm tính. Đối với người dùng chưa đăng nhập, giỏ hàng được lưu trữ trong localStorage của trình duyệt. Đối với người dùng đã đăng nhập, giỏ hàng được lưu trữ trên server và đồng bộ giữa các thiết bị.

**FR-3.3: Cập nhật số lượng sản phẩm**

Người dùng có thể thay đổi số lượng sản phẩm trong giỏ hàng bằng cách nhập số lượng mới hoặc sử dụng nút tăng/giảm. Hệ thống kiểm tra số lượng tồn kho trước khi cập nhật và hiển thị cảnh báo nếu số lượng yêu cầu vượt quá tồn kho. Tổng tiền được tự động cập nhật sau mỗi lần thay đổi số lượng.

**FR-3.4: Xóa sản phẩm khỏi giỏ hàng**

Người dùng có thể xóa từng sản phẩm khỏi giỏ hàng bằng cách nhấn nút xóa. Hệ thống yêu cầu xác nhận trước khi xóa để tránh thao tác nhầm. Người dùng cũng có thể xóa toàn bộ giỏ hàng bằng một thao tác.

**FR-3.5: Giỏ hàng cho khách vãng lai**

Khách vãng lai (chưa đăng nhập) vẫn có thể thêm sản phẩm vào giỏ hàng. Giỏ hàng được lưu trữ trong localStorage và tồn tại cho đến khi người dùng xóa cache trình duyệt. Khi khách vãng lai đăng nhập hoặc đăng ký, hệ thống tự động chuyển giỏ hàng từ localStorage sang giỏ hàng của tài khoản, hợp nhất với các sản phẩm đã có nếu có.

### 2.2.4. Quản lý đơn hàng

**FR-4.1: Tạo đơn hàng từ giỏ hàng**

Người dùng khởi tạo quá trình đặt hàng từ trang giỏ hàng. Hệ thống yêu cầu người dùng chọn hoặc nhập địa chỉ giao hàng. Người dùng có thể nhập mã voucher để nhận ưu đãi. Hệ thống hiển thị bản tóm tắt đơn hàng với các thông tin: danh sách sản phẩm, số lượng, giá, địa chỉ giao hàng, và chi tiết tính giá. Người dùng xác nhận thông tin và chọn phương thức thanh toán để hoàn tất đơn hàng.

**FR-4.2: Tính giá đơn hàng với Decorator Pattern**

Hệ thống áp dụng Decorator Pattern để tính giá đơn hàng một cách linh hoạt. Quy trình tính giá bao gồm các bước: tính tổng tiền sản phẩm (giá gốc), thêm thuế VAT mười phần trăm, trừ giảm giá từ voucher nếu có, thêm phí vận chuyển hoặc miễn phí vận chuyển nếu đơn hàng đạt giá trị tối thiểu năm trăm nghìn đồng. Mỗi thành phần giá được tính toán bởi một decorator riêng biệt, cho phép dễ dàng thêm hoặc bỏ các thành phần giá trong tương lai.

**FR-4.3: Theo dõi trạng thái đơn hàng**

Đơn hàng có các trạng thái: Chờ xử lý, Đã xác nhận, Đang đóng gói, Đang vận chuyển, Đã giao hàng, Đã hủy. Người dùng có thể xem trạng thái hiện tại của đơn hàng và lịch sử thay đổi trạng thái với thời gian cụ thể. Hệ thống gửi thông báo qua email mỗi khi trạng thái đơn hàng thay đổi. Đối với đơn hàng đang vận chuyển, hệ thống hiển thị mã vận đơn và liên kết để tra cứu trên trang của đơn vị vận chuyển.

**FR-4.4: Hủy đơn hàng**

Người dùng có thể hủy đơn hàng khi đơn hàng đang ở trạng thái "Chờ xử lý". Khi hủy đơn hàng, hệ thống yêu cầu người dùng chọn lý do hủy. Sau khi hủy, hệ thống hoàn lại số lượng sản phẩm vào kho và cập nhật trạng thái đơn hàng thành "Đã hủy". Nếu đơn hàng đã thanh toán, hệ thống khởi tạo quy trình hoàn tiền.

### 2.2.5. Thanh toán

**FR-5.1: Tích hợp VNPay Payment Gateway**

Hệ thống tích hợp cổng thanh toán VNPay để xử lý thanh toán trực tuyến. Sau khi người dùng xác nhận đơn hàng, hệ thống tạo URL thanh toán VNPay với các thông tin: mã đơn hàng, số tiền, thông tin đơn hàng. Người dùng được chuyển hướng đến trang thanh toán của VNPay để thực hiện giao dịch. VNPay hỗ trợ nhiều phương thức thanh toán: thẻ ATM nội địa, thẻ tín dụng quốc tế, ví điện tử, QR code.

**FR-5.2: Xử lý kết quả thanh toán**

Sau khi người dùng hoàn tất thanh toán trên VNPay, hệ thống nhận thông tin kết quả thông qua URL return. Hệ thống xác thực chữ ký số từ VNPay để đảm bảo tính toàn vẹn của dữ liệu. Nếu thanh toán thành công, hệ thống cập nhật trạng thái thanh toán của đơn hàng và hiển thị trang xác nhận thành công. Nếu thanh toán thất bại, hệ thống hiển thị thông báo lỗi và cho phép người dùng thử lại.

**FR-5.3: Xử lý webhook từ VNPay**

Hệ thống cung cấp endpoint để nhận IPN (Instant Payment Notification) từ VNPay. Khi nhận được IPN, hệ thống xác thực chữ ký và cập nhật trạng thái thanh toán trong database. Cơ chế IPN đảm bảo hệ thống luôn nhận được thông báo về kết quả giao dịch ngay cả khi người dùng đóng trình duyệt sau khi thanh toán.

### 2.2.6. Quản trị (Admin)

**FR-6.1: Quản lý sản phẩm**

Admin có thể thêm sản phẩm mới với đầy đủ thông tin: tên, mô tả, giá, danh mục, thương hiệu, độ tuổi phù hợp, số lượng tồn kho, hình ảnh. Hệ thống hỗ trợ upload nhiều hình ảnh cho một sản phẩm. Admin có thể chỉnh sửa thông tin sản phẩm và cập nhật số lượng tồn kho. Thay vì xóa vĩnh viễn, hệ thống sử dụng soft delete, đánh dấu sản phẩm là không khả dụng nhưng vẫn giữ lại dữ liệu để phục vụ báo cáo và lịch sử đơn hàng.

**FR-6.2: Quản lý danh mục và thương hiệu**

Admin có thể thêm, sửa, xóa danh mục sản phẩm và thương hiệu. Mỗi danh mục và thương hiệu có tên và mô tả. Hệ thống kiểm tra và không cho phép xóa danh mục hoặc thương hiệu đang có sản phẩm.

**FR-6.3: Quản lý đơn hàng**

Admin có thể xem danh sách tất cả đơn hàng với khả năng lọc theo trạng thái, ngày đặt, khách hàng. Admin có thể xem chi tiết đơn hàng và cập nhật trạng thái đơn hàng. Khi cập nhật trạng thái, hệ thống tự động gửi email thông báo cho khách hàng. Admin có thể tạo đơn vận chuyển trên hệ thống Giao Hàng Nhanh trực tiếp từ giao diện quản lý đơn hàng.

**FR-6.4: Quản lý người dùng**

Admin có thể xem danh sách tất cả người dùng với thông tin: tên, email, số điện thoại, vai trò, trạng thái tài khoản. Admin có thể vô hiệu hóa hoặc kích hoạt lại tài khoản người dùng. Admin có thể thay đổi vai trò của người dùng giữa user, staff và admin. Hệ thống ghi lại lịch sử các thao tác quản lý người dùng để phục vụ kiểm toán.

**FR-6.5: Quản lý voucher**

Admin có thể tạo voucher với các thông tin: mã voucher, loại giảm giá (phần trăm hoặc số tiền cố định), giá trị giảm, giá trị đơn hàng tối thiểu, số lượng voucher, thời gian bắt đầu và kết thúc. Admin có thể chỉnh sửa thông tin voucher và vô hiệu hóa voucher khi cần. Hệ thống hiển thị thống kê về số lượng voucher đã sử dụng và hiệu quả của từng voucher.

**FR-6.6: Thống kê và báo cáo**

Hệ thống cung cấp dashboard với các chỉ số quan trọng: doanh thu theo ngày/tuần/tháng, số lượng đơn hàng, số lượng khách hàng mới, sản phẩm bán chạy nhất. Admin có thể xem biểu đồ trực quan về xu hướng doanh thu và đơn hàng theo thời gian. Hệ thống cung cấp báo cáo chi tiết về doanh thu theo sản phẩm, danh mục, thương hiệu. Admin có thể xuất báo cáo dưới dạng file Excel hoặc PDF.

## 2.3. Yêu cầu phi chức năng (Non-Functional Requirements)

Yêu cầu phi chức năng định nghĩa các thuộc tính chất lượng của hệ thống, ảnh hưởng đến trải nghiệm người dùng và khả năng vận hành của hệ thống.

### 2.3.1. Hiệu suất (Performance)

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

# PHẦN 4: THIẾT KẾ KIẾN TRÚC HỆ THỐNG

## 4.1. Kiến trúc tổng thể

Hệ thống ToyStore được xây dựng dựa trên kiến trúc ba tầng (3-Tier Architecture), một mô hình kiến trúc phổ biến và được chứng minh là hiệu quả trong phát triển các ứng dụng web quy mô vừa và lớn. Kiến trúc này tách biệt hệ thống thành ba tầng độc lập: tầng trình diễn (Presentation Tier), tầng logic nghiệp vụ (Business Logic Tier), và tầng dữ liệu (Data Tier).

### 4.1.1. Tổng quan kiến trúc ba tầng

Kiến trúc ba tầng tổ chức hệ thống theo nguyên tắc phân tách trách nhiệm (Separation of Concerns), trong đó mỗi tầng có một vai trò và trách nhiệm cụ thể. Tầng trình diễn chịu trách nhiệm tương tác với người dùng, hiển thị thông tin và nhận input. Tầng logic nghiệp vụ xử lý các quy tắc nghiệp vụ, tính toán và điều phối luồng dữ liệu. Tầng dữ liệu quản lý việc lưu trữ và truy xuất dữ liệu.

Sự tách biệt này mang lại nhiều lợi ích quan trọng. Thứ nhất, mỗi tầng có thể được phát triển, kiểm thử và bảo trì độc lập. Thứ hai, thay đổi ở một tầng ít ảnh hưởng đến các tầng khác, miễn là interface giữa các tầng được giữ nguyên. Thứ ba, mỗi tầng có thể được mở rộng (scale) độc lập dựa trên nhu cầu thực tế.

### 4.1.2. Sơ đồ kiến trúc tổng thể của ToyStore

Trong hệ thống ToyStore, ba tầng được triển khai như sau:

**Tầng trình diễn (Presentation Tier)** được xây dựng bằng React.js, một thư viện JavaScript phổ biến cho việc xây dựng giao diện người dùng. Tầng này bao gồm hai phần chính: giao diện người dùng (customer-facing) và giao diện quản trị (admin-facing). Giao diện được thiết kế responsive, tương thích với nhiều kích thước màn hình từ desktop đến mobile. Tầng này giao tiếp với tầng logic nghiệp vụ thông qua các RESTful API calls sử dụng thư viện Axios.

**Tầng logic nghiệp vụ (Business Logic Tier)** được phát triển bằng Node.js và Express.js. Tầng này đóng vai trò trung tâm của hệ thống, xử lý tất cả logic nghiệp vụ, xác thực và phân quyền, tích hợp với các dịch vụ bên ngoài. Tầng này được tổ chức thành các module rõ ràng: controllers xử lý HTTP requests, services chứa logic nghiệp vụ, middlewares xử lý các tác vụ trung gian như authentication và logging, và các Design Pattern implementations để tối ưu hóa cấu trúc code.

**Tầng dữ liệu (Data Tier)** sử dụng SQL Server làm hệ quản trị cơ sở dữ liệu. Sequelize ORM được sử dụng làm lớp trung gian giữa tầng logic nghiệp vụ và database, cung cấp một cách thức tương tác với database an toàn và dễ bảo trì. Tầng này chịu trách nhiệm lưu trữ tất cả dữ liệu của hệ thống: thông tin người dùng, sản phẩm, đơn hàng, giao dịch.

### 4.1.3. Luồng giao tiếp giữa các tầng

Giao tiếp giữa các tầng tuân theo nguyên tắc một chiều từ trên xuống. Tầng trình diễn chỉ giao tiếp với tầng logic nghiệp vụ thông qua HTTP/HTTPS protocol, sử dụng các RESTful API endpoints. Tầng logic nghiệp vụ giao tiếp với tầng dữ liệu thông qua Sequelize ORM, sử dụng các phương thức như findAll, findOne, create, update, destroy.

Khi người dùng thực hiện một thao tác trên giao diện, ví dụ như xem danh sách sản phẩm, luồng xử lý diễn ra như sau: Frontend gửi HTTP GET request đến endpoint /api/products. Backend nhận request, controller tương ứng được gọi. Controller gọi service để lấy dữ liệu. Service sử dụng Sequelize để query database. Database trả về dữ liệu. Service xử lý và format dữ liệu nếu cần. Controller trả về HTTP response dưới dạng JSON. Frontend nhận response và hiển thị dữ liệu cho người dùng.

## 4.2. Lý do chọn kiến trúc ba tầng

Việc lựa chọn kiến trúc ba tầng cho hệ thống ToyStore dựa trên nhiều yếu tố kỹ thuật và nghiệp vụ.

### 4.2.1. Tách biệt trách nhiệm rõ ràng

Nguyên tắc Separation of Concerns là nền tảng của kiến trúc ba tầng. Mỗi tầng có một trách nhiệm cụ thể và không can thiệp vào trách nhiệm của tầng khác. Tầng trình diễn chỉ lo về việc hiển thị và tương tác với người dùng, không chứa logic nghiệp vụ. Tầng logic nghiệp vụ xử lý các quy tắc nghiệp vụ mà không quan tâm đến cách dữ liệu được hiển thị hay lưu trữ. Tầng dữ liệu chỉ lo việc lưu trữ và truy xuất dữ liệu.

Sự tách biệt này giúp code dễ hiểu, dễ bảo trì. Khi cần sửa lỗi hoặc thêm tính năng, developer có thể tập trung vào một tầng cụ thể mà không cần lo lắng về tác động đến các tầng khác. Ví dụ, khi cần thay đổi giao diện từ React sang Vue.js, chỉ cần thay đổi tầng trình diễn mà không ảnh hưởng đến backend và database.

### 4.2.2. Dễ bảo trì và mở rộng

Kiến trúc ba tầng tạo điều kiện thuận lợi cho việc bảo trì và mở rộng hệ thống. Khi cần thêm một tính năng mới, ví dụ như chức năng đánh giá sản phẩm, developer có thể thêm component mới ở frontend, controller và service mới ở backend, và bảng mới ở database một cách độc lập. Các thay đổi này không ảnh hưởng đến các tính năng hiện có nếu được thực hiện đúng cách.

Việc debug cũng trở nên dễ dàng hơn khi hệ thống được tổ chức theo tầng. Nếu có lỗi xảy ra, developer có thể xác định lỗi thuộc về tầng nào: lỗi hiển thị thuộc frontend, lỗi logic nghiệp vụ thuộc backend, lỗi dữ liệu thuộc database. Điều này giúp thu hẹp phạm vi tìm kiếm và sửa lỗi nhanh chóng.

### 4.2.3. Khả năng mở rộng theo chiều ngang

Một trong những lợi thế lớn của kiến trúc ba tầng là khả năng mở rộng (scaling) linh hoạt. Mỗi tầng có thể được mở rộng độc lập dựa trên nhu cầu thực tế. Nếu hệ thống gặp bottleneck ở tầng logic nghiệp vụ do số lượng request tăng cao, có thể thêm nhiều server backend để phân tải mà không cần thay đổi frontend hay database.

Trong ToyStore, backend được thiết kế stateless, nghĩa là không lưu trữ session state trong memory của server. Session được lưu trong database hoặc có thể sử dụng Redis. Điều này cho phép triển khai nhiều instance của backend server phía sau một load balancer. Các request từ cùng một người dùng có thể được xử lý bởi các server khác nhau mà không gặp vấn đề.

### 4.2.4. Bảo mật tốt hơn

Kiến trúc ba tầng cung cấp nhiều lớp bảo vệ cho hệ thống. Tầng dữ liệu không tiếp xúc trực tiếp với internet, chỉ có tầng logic nghiệp vụ mới có quyền truy cập. Điều này giảm thiểu rủi ro tấn công trực tiếp vào database. Tất cả các request từ frontend phải đi qua tầng logic nghiệp vụ, nơi có các middleware để xác thực, phân quyền và validate input.

Trong ToyStore, mọi API endpoint đều được bảo vệ bằng authentication middleware. Các thao tác nhạy cảm như quản lý sản phẩm, đơn hàng yêu cầu quyền admin hoặc staff. Input từ người dùng được validate và sanitize ở backend trước khi xử lý, ngăn chặn các cuộc tấn công như SQL injection, XSS.

### 4.2.5. Tái sử dụng API

Một lợi ích quan trọng khác của kiến trúc ba tầng là khả năng tái sử dụng API. Tầng logic nghiệp vụ cung cấp các RESTful API có thể được sử dụng bởi nhiều client khác nhau: web application, mobile application, hoặc thậm chí các hệ thống bên thứ ba thông qua API integration.

Trong tương lai, nếu ToyStore muốn phát triển ứng dụng mobile, có thể sử dụng lại toàn bộ backend API hiện có mà không cần thay đổi. Chỉ cần phát triển mobile app mới ở tầng trình diễn. Điều này tiết kiệm đáng kể thời gian và chi phí phát triển.

### 4.2.6. Phù hợp với quy mô dự án

Kiến trúc ba tầng là lựa chọn cân bằng giữa đơn giản và linh hoạt cho dự án quy mô vừa như ToyStore. So với kiến trúc monolithic đơn giản hơn nhưng khó mở rộng, ba tầng cung cấp sự tách biệt cần thiết mà không quá phức tạp. So với microservices phức tạp và overhead cao, ba tầng dễ quản lý hơn với nhóm nhỏ và không yêu cầu infrastructure phức tạp.

## 4.3. Các thành phần chính

### 4.3.1. Tầng trình diễn (Presentation Tier)

Tầng trình diễn là giao diện giữa người dùng và hệ thống, được xây dựng hoàn toàn bằng React.js và các công nghệ web hiện đại.

**Công nghệ sử dụng**

React.js phiên bản 18 là thư viện chính để xây dựng giao diện người dùng. React được chọn vì khả năng tạo ra giao diện động, hiệu suất cao với Virtual DOM, và hệ sinh thái phong phú với nhiều thư viện hỗ trợ. Tailwind CSS được sử dụng để styling, cung cấp các utility classes giúp phát triển giao diện nhanh chóng và nhất quán. React Router quản lý routing phía client, cho phép điều hướng giữa các trang mà không cần reload toàn bộ ứng dụng. Axios là thư viện HTTP client để giao tiếp với backend API.

**Cấu trúc thư mục**

Frontend được tổ chức theo cấu trúc component-based. Thư mục components chứa các React components tái sử dụng như Button, Input, ProductCard, Header, Footer. Thư mục pages chứa các components đại diện cho từng trang: HomePage, ProductListPage, ProductDetailPage, CartPage, CheckoutPage, OrderHistoryPage. Thư mục services chứa các module để gọi API: productService, orderService, authService. Thư mục contexts chứa React Context cho state management toàn cục như AuthContext, CartContext.

**State management**

Hệ thống sử dụng kết hợp local state và Context API để quản lý state. Local state được sử dụng cho các component độc lập, ví dụ như form input, modal visibility. Context API được sử dụng cho state cần chia sẻ giữa nhiều components như thông tin người dùng đăng nhập, giỏ hàng. Cách tiếp cận này đơn giản hơn so với Redux nhưng vẫn đáp ứng tốt nhu cầu của dự án.

**Responsive design**

Giao diện được thiết kế responsive sử dụng Tailwind CSS breakpoints. Layout tự động điều chỉnh dựa trên kích thước màn hình: desktop hiển thị nhiều cột, tablet hiển thị ít cột hơn, mobile hiển thị một cột. Hình ảnh được tối ưu với lazy loading và responsive images. Navigation menu chuyển thành hamburger menu trên mobile.

**Hai giao diện chính**

Tầng trình diễn bao gồm hai giao diện riêng biệt. Giao diện khách hàng (customer-facing) cho phép người dùng duyệt sản phẩm, thêm vào giỏ hàng, đặt hàng, thanh toán và quản lý tài khoản. Giao diện này tập trung vào trải nghiệm người dùng, với thiết kế thân thiện và quy trình mua hàng đơn giản. Giao diện quản trị (admin-facing) cung cấp các công cụ quản lý cho admin và staff: quản lý sản phẩm, đơn hàng, người dùng, voucher, và xem thống kê. Giao diện này tập trung vào hiệu quả và đầy đủ thông tin.

### 4.3.2. Tầng logic nghiệp vụ (Business Logic Tier)

Tầng logic nghiệp vụ là trung tâm của hệ thống, xử lý tất cả logic nghiệp vụ và điều phối luồng dữ liệu.

**Công nghệ sử dụng**

Node.js phiên bản 18 LTS là runtime environment, được chọn vì hiệu suất cao với non-blocking I/O, phù hợp cho ứng dụng web có nhiều request đồng thời. Express.js phiên bản 4 là web framework, cung cấp các công cụ để xây dựng RESTful API một cách nhanh chóng. Sequelize phiên bản 6 là ORM để tương tác với SQL Server, giúp viết code database an toàn và dễ bảo trì. Passport.js được sử dụng cho authentication, hỗ trợ nhiều strategy như JWT và OAuth.

**Cấu trúc thư mục**

Backend được tổ chức theo mô hình MVC (Model-View-Controller) với một số điều chỉnh. Thư mục models chứa các Sequelize models định nghĩa cấu trúc bảng và quan hệ. Thư mục controllers chứa các controller xử lý HTTP requests, validate input và gọi services. Thư mục services chứa logic nghiệp vụ phức tạp, tách biệt khỏi controllers để dễ test và tái sử dụng. Thư mục routes định nghĩa các API endpoints và mapping với controllers. Thư mục middlewares chứa các middleware như authentication, authorization, error handling, rate limiting. Thư mục utils chứa các utility functions dùng chung. Thư mục decorators, strategies, states chứa implementations của các Design Patterns.

**Controllers**

Controllers đóng vai trò là lớp đầu tiên nhận và xử lý HTTP requests. Mỗi controller tương ứng với một nhóm chức năng: ProductController xử lý các request liên quan đến sản phẩm, OrderController xử lý đơn hàng, AuthController xử lý authentication. Controllers có trách nhiệm validate input từ request, gọi services để xử lý logic nghiệp vụ, format response và trả về cho client. Controllers không chứa logic nghiệp vụ phức tạp, giữ code ngắn gọn và dễ đọc.

**Services**

Services chứa logic nghiệp vụ chính của hệ thống. Ví dụ, OrderService xử lý logic tạo đơn hàng: kiểm tra tồn kho, tính giá sử dụng Decorator Pattern, tạo bản ghi đơn hàng, trừ tồn kho, tạo đơn vận chuyển GHN. AddressService xử lý logic liên quan đến địa chỉ giao hàng. ReviewService xử lý đánh giá sản phẩm. Việc tách logic nghiệp vụ ra services giúp code dễ test, dễ tái sử dụng và tuân thủ Single Responsibility Principle.

**Middlewares**

Middlewares là các hàm xử lý trung gian trong request-response cycle. Authentication middleware kiểm tra JWT token và xác thực người dùng. Authorization middleware kiểm tra quyền hạn của người dùng dựa trên vai trò. Error handling middleware bắt và xử lý lỗi một cách tập trung, trả về error response nhất quán. Rate limiting middleware giới hạn số lượng request từ một IP trong một khoảng thời gian để chống DDoS. Upload middleware xử lý việc upload file sử dụng Multer.

**Design Patterns**

Tầng logic nghiệp vụ triển khai ba Design Patterns chính. Decorator Pattern được sử dụng để tính giá đơn hàng một cách linh hoạt, với các decorators: VATDecorator, VoucherDecorator, ShippingDecorator. Strategy Pattern được áp dụng cho việc lọc và sắp xếp sản phẩm, với các strategies: NewestStrategy, PriceAscendingStrategy, PriceDescendingStrategy, BestSellerStrategy. Singleton Pattern được sử dụng cho các utility classes như DBConnection, Logger, ConfigService để đảm bảo chỉ có một instance duy nhất.

### 4.3.3. Tầng dữ liệu (Data Tier)

Tầng dữ liệu chịu trách nhiệm lưu trữ và quản lý tất cả dữ liệu của hệ thống.

**Hệ quản trị cơ sở dữ liệu**

SQL Server 2019 được chọn làm hệ quản trị cơ sở dữ liệu. SQL Server là một RDBMS mạnh mẽ, ổn định và được sử dụng rộng rãi trong doanh nghiệp. Nó cung cấp các tính năng quan trọng như transaction support, foreign key constraints, stored procedures, views. SQL Server cũng có công cụ quản lý trực quan (SQL Server Management Studio) giúp dễ dàng quản lý database.

**Sequelize ORM**

Sequelize được sử dụng làm lớp trung gian giữa Node.js và SQL Server. ORM (Object-Relational Mapping) cho phép tương tác với database thông qua các object và method thay vì viết SQL trực tiếp. Sequelize cung cấp nhiều lợi ích: tự động escape parameters ngăn chặn SQL injection, hỗ trợ migrations để quản lý schema changes, cung cấp các phương thức tiện lợi như findAll, findOne, create, update, destroy, hỗ trợ associations và eager loading.

**Database schema**

Database được thiết kế với 21 bảng chính, được chuẩn hóa đến dạng chuẩn 3NF (Third Normal Form). Các bảng chính bao gồm: TaiKhoan lưu thông tin đăng nhập, KhachHang lưu thông tin khách hàng, SanPham lưu thông tin sản phẩm, LoaiSP và ThuongHieu lưu danh mục và thương hiệu, GioHang và GioHangChiTiet quản lý giỏ hàng, HoaDon và ChiTietHoaDon quản lý đơn hàng, Voucher và LichSuSuDungVoucher quản lý voucher, DiaChiGiaoHangUser và DiaChiGiaoHang quản lý địa chỉ, ThongTinVanChuyen lưu thông tin vận chuyển, DanhGiaSanPham lưu đánh giá.

**Quan hệ giữa các bảng**

Database được thiết kế với các quan hệ rõ ràng. Quan hệ một-một: TaiKhoan và KhachHang, HoaDon và DiaChiGiaoHang, HoaDon và ThongTinVanChuyen. Quan hệ một-nhiều: KhachHang có nhiều HoaDon, HoaDon có nhiều ChiTietHoaDon, SanPham có nhiều ChiTietHoaDon, LoaiSP có nhiều SanPham, ThuongHieu có nhiều SanPham. Các quan hệ này được định nghĩa trong Sequelize models sử dụng hasOne, hasMany, belongsTo.

**Indexing và optimization**

Để tối ưu hiệu suất truy vấn, các index được tạo trên các cột thường xuyên được sử dụng trong WHERE clause và JOIN: primary keys tự động có index, foreign keys được index, các cột như Email trong TaiKhoan, TenSP trong SanPham được index để tăng tốc tìm kiếm. Các truy vấn phức tạp được phân tích và tối ưu sử dụng execution plan.

## 4.4. Sơ đồ luồng dữ liệu chính

Để hiểu rõ cách các tầng tương tác với nhau, cần phân tích các luồng dữ liệu chính trong hệ thống.

### 4.4.1. Luồng đặt hàng

Luồng đặt hàng là một trong những luồng nghiệp vụ phức tạp nhất, liên quan đến nhiều thành phần và xử lý nhiều logic nghiệp vụ.

**Bước 1: Người dùng xác nhận đặt hàng**

Người dùng vào trang giỏ hàng, xem lại các sản phẩm đã chọn và nhấn nút "Đặt hàng". Frontend gửi request đến trang checkout. Tại trang checkout, người dùng chọn hoặc nhập địa chỉ giao hàng, có thể nhập mã voucher nếu có.

**Bước 2: Frontend gửi request tạo đơn hàng**

Khi người dùng xác nhận thông tin và nhấn "Thanh toán", frontend gửi POST request đến endpoint /api/orders/create với payload chứa: danh sách sản phẩm từ giỏ hàng, địa chỉ giao hàng, mã voucher nếu có.

**Bước 3: Backend xác thực và xử lý**

OrderController nhận request, kiểm tra authentication token để xác định người dùng. Controller gọi OrderService.createOrder() để xử lý logic tạo đơn hàng. OrderService thực hiện các bước: lấy thông tin giỏ hàng từ database, kiểm tra tồn kho cho từng sản phẩm, nếu không đủ hàng trả về lỗi.

**Bước 4: Tính giá sử dụng Decorator Pattern**

OrderService sử dụng Decorator Pattern để tính giá đơn hàng. Tạo OrderPriceCalculator với danh sách sản phẩm. Wrap với VATDecorator để thêm VAT mười phần trăm. Nếu có voucher, wrap với VoucherDecorator để trừ giảm giá. Wrap với ShippingDecorator để thêm phí vận chuyển hoặc miễn phí nếu đơn hàng đạt giá trị tối thiểu. Gọi calculate() để lấy tổng tiền cuối cùng và getDetails() để lấy chi tiết từng thành phần giá.

**Bước 5: Tạo bản ghi đơn hàng**

OrderService tạo bản ghi trong bảng HoaDon với các thông tin: khách hàng, tổng tiền, các thành phần giá (TienGoc, TienVAT, TienGiamGia, PhiVanChuyen), trạng thái "Chờ xử lý", phương thức thanh toán. Tạo các bản ghi trong ChiTietHoaDon cho từng sản phẩm. Tạo bản ghi DiaChiGiaoHang với thông tin địa chỉ giao hàng. Nếu có voucher, tạo bản ghi LichSuSuDungVoucher.

**Bước 6: Tích hợp thanh toán VNPay**

OrderService gọi PaymentService để tạo URL thanh toán VNPay. PaymentService tạo các tham số cần thiết: số tiền, mã đơn hàng, thông tin đơn hàng, URL return. Tạo chữ ký bảo mật sử dụng secret key. Tạo URL thanh toán VNPay với các tham số đã mã hóa.

**Bước 7: Chuyển hướng đến VNPay**

Backend trả về URL thanh toán cho frontend. Frontend chuyển hướng người dùng đến trang thanh toán VNPay. Người dùng thực hiện thanh toán trên VNPay.

**Bước 8: Xử lý kết quả thanh toán**

Sau khi thanh toán, VNPay chuyển hướng người dùng về URL return của ToyStore với các tham số kết quả. Frontend gửi các tham số này đến backend để xác thực. Backend xác thực chữ ký từ VNPay, kiểm tra tính toàn vẹn dữ liệu. Nếu thanh toán thành công, cập nhật trạng thái thanh toán của đơn hàng, trừ tồn kho cho các sản phẩm, xóa giỏ hàng. Nếu thanh toán thất bại, giữ nguyên trạng thái đơn hàng hoặc hủy đơn hàng.

**Bước 9: Phản hồi cho người dùng**

Backend trả về kết quả cho frontend. Frontend hiển thị trang xác nhận đơn hàng thành công hoặc thông báo lỗi. Gửi email xác nhận đơn hàng cho khách hàng.

### 4.4.2. Luồng lọc và sắp xếp sản phẩm

Luồng này minh họa cách Strategy Pattern được áp dụng trong thực tế.

**Bước 1: Người dùng chọn tiêu chí lọc/sắp xếp**

Người dùng vào trang danh sách sản phẩm, chọn tiêu chí sắp xếp từ dropdown: "Mới nhất", "Giá tăng dần", "Giá giảm dần", "Bán chạy nhất". Có thể chọn thêm bộ lọc: khoảng giá, danh mục, thương hiệu.

**Bước 2: Frontend gửi request**

Frontend gửi GET request đến /api/products với query parameters: filter (loại sắp xếp), minPrice, maxPrice, categoryId, brandId, page, limit.

**Bước 3: Backend nhận và xử lý**

ProductController nhận request, parse các query parameters. Gọi ProductService để lấy danh sách sản phẩm từ database với các includes cần thiết (LoaiSP, ThuongHieu, ChiTietHoaDons cho BestSellerStrategy).

**Bước 4: Áp dụng Strategy Pattern**

ProductService gọi FilterContext.applyFilter() với các tham số: danh sách sản phẩm, filterType (ví dụ "priceAsc"), queryParams (minPrice, maxPrice, categoryId). FilterContext tra cứu strategy tương ứng trong registry. Nếu filterType là "priceAsc", lấy PriceAscendingStrategy. Gọi strategy.filter(products, queryParams). Strategy thực hiện lọc và sắp xếp: lọc theo khoảng giá nếu có, lọc theo danh mục nếu có, sắp xếp theo tiêu chí của strategy. Trả về danh sách sản phẩm đã lọc và sắp xếp.

**Bước 5: Phân trang và trả về**

ProductService áp dụng phân trang trên danh sách đã lọc. Tính tổng số trang dựa trên limit. Lấy subset của sản phẩm cho trang hiện tại. ProductController format response với thông tin: danh sách sản phẩm, thông tin phân trang (trang hiện tại, tổng số trang, tổng số sản phẩm), thông tin filter đang áp dụng. Trả về JSON response cho frontend.

**Bước 6: Frontend hiển thị**

Frontend nhận response, cập nhật state với danh sách sản phẩm mới. Re-render component ProductList với dữ liệu mới. Cập nhật UI phân trang.

### 4.4.3. Luồng xác thực người dùng

Luồng này minh họa cách JWT authentication hoạt động trong hệ thống.

**Bước 1: Người dùng đăng nhập**

Người dùng nhập email và mật khẩu vào form đăng nhập. Frontend gửi POST request đến /api/auth/login với payload chứa email và password.

**Bước 2: Backend xác thực**

AuthController nhận request, gọi AuthService.login(). AuthService tìm user trong database theo email. Nếu không tìm thấy, trả về lỗi "Email không tồn tại". Nếu tìm thấy, so sánh password hash sử dụng bcrypt.compare(). Nếu password không khớp, trả về lỗi "Mật khẩu không đúng".

**Bước 3: Tạo JWT token**

Nếu xác thực thành công, AuthService tạo JWT token chứa payload: userId, email, role, expiresIn (thời gian sống của token). Ký token sử dụng secret key. Trả về token cho controller.

**Bước 4: Trả về cho client**

AuthController trả về response chứa: token, thông tin user (không bao gồm password). Frontend lưu token vào localStorage. Lưu thông tin user vào AuthContext.

**Bước 5: Sử dụng token cho các request sau**

Khi gọi các API cần authentication, frontend thêm token vào header: Authorization: Bearer <token>. Backend có authentication middleware kiểm tra token. Middleware lấy token từ header, verify token sử dụng secret key. Nếu token hợp lệ, decode để lấy thông tin user, gắn thông tin user vào request object (req.user). Cho phép request tiếp tục đến controller. Nếu token không hợp lệ hoặc hết hạn, trả về lỗi 401 Unauthorized.

## 4.5. Tích hợp bên ngoài

Hệ thống ToyStore tích hợp với hai dịch vụ bên ngoài quan trọng để cung cấp tính năng thanh toán và vận chuyển.

### 4.5.1. Tích hợp VNPay Payment Gateway

VNPay là một trong những cổng thanh toán trực tuyến phổ biến nhất tại Việt Nam, hỗ trợ nhiều phương thức thanh toán.

**Quy trình tích hợp**

Đăng ký tài khoản merchant với VNPay và nhận thông tin: TMN Code (mã merchant), Hash Secret (secret key để tạo chữ ký). Cấu hình các thông tin này trong file .env của backend. Triển khai PaymentService để tạo URL thanh toán và xử lý callback.

**Tạo URL thanh toán**

Khi tạo đơn hàng, PaymentService.createPaymentUrl() được gọi với các tham số: orderId, amount, orderInfo. Service tạo các tham số theo định dạng VNPay yêu cầu: vnp_Version, vnp_Command, vnp_TmnCode, vnp_Amount (số tiền nhân 100), vnp_CreateDate, vnp_CurrCode (VND), vnp_IpAddr, vnp_Locale (vn), vnp_OrderInfo, vnp_OrderType, vnp_ReturnUrl, vnp_TxnRef (mã đơn hàng). Sắp xếp các tham số theo thứ tự alphabet. Tạo chuỗi query string. Tạo chữ ký HMAC SHA512 sử dụng Hash Secret. Thêm chữ ký vào query string. Tạo URL đầy đủ đến VNPay payment gateway.

**Xử lý callback**

Sau khi thanh toán, VNPay chuyển hướng người dùng về returnUrl với các tham số kết quả. PaymentService.handleReturn() nhận các tham số, xác thực chữ ký để đảm bảo dữ liệu không bị giả mạo. Kiểm tra vnp_ResponseCode: "00" nghĩa là thành công. Cập nhật trạng thái thanh toán của đơn hàng trong database. Trả về kết quả cho frontend để hiển thị.

**Xử lý IPN (Instant Payment Notification)**

VNPay cũng gửi IPN đến một endpoint riêng của backend để thông báo kết quả giao dịch. Điều này đảm bảo backend luôn nhận được thông báo ngay cả khi người dùng đóng trình duyệt. PaymentService.handleIPN() xác thực chữ ký, cập nhật trạng thái thanh toán, trả về response cho VNPay theo định dạng yêu cầu.

### 4.5.2. Tích hợp Giao Hàng Nhanh (GHN) API

GHN là đơn vị vận chuyển được tích hợp để tạo đơn vận chuyển và theo dõi trạng thái giao hàng.

**Quy trình tích hợp**

Đăng ký tài khoản doanh nghiệp với GHN và nhận API token. Cấu hình thông tin: API token, Shop ID, từ địa chỉ (kho hàng). Triển khai GHNService để giao tiếp với GHN API.

**Tạo đơn vận chuyển**

Khi admin cập nhật trạng thái đơn hàng thành "Đang vận chuyển", hệ thống tự động tạo đơn vận chuyển trên GHN. GHNService.createOrder() được gọi với thông tin: địa chỉ người nhận (từ DiaChiGiaoHang), danh sách sản phẩm, trọng lượng, kích thước, giá trị đơn hàng, ghi chú. Service gửi POST request đến GHN API endpoint /v2/shipping-order/create. GHN trả về mã vận đơn (order_code) và thông tin phí vận chuyển. Hệ thống lưu mã vận đơn vào bảng ThongTinVanChuyen.

**Tra cứu trạng thái vận chuyển**

Khách hàng có thể sử dụng mã vận đơn để tra cứu trạng thái trên website GHN. Hệ thống cũng có thể gọi GHN API để lấy thông tin trạng thái và cập nhật vào database. GHNService.getOrderStatus() gửi GET request đến /v2/shipping-order/detail với order_code. GHN trả về thông tin chi tiết: trạng thái hiện tại, lịch sử thay đổi trạng thái, thời gian dự kiến giao hàng.

**Webhook từ GHN**

GHN có thể gửi webhook đến hệ thống khi trạng thái đơn hàng thay đổi. Hệ thống cung cấp endpoint để nhận webhook, xác thực request từ GHN, cập nhật trạng thái vận chuyển trong database, gửi thông báo cho khách hàng nếu cần.

### 4.5.3. Lợi ích của việc tích hợp

Tích hợp với các dịch vụ bên ngoài mang lại nhiều lợi ích. Giảm chi phí và thời gian phát triển: không cần xây dựng hệ thống thanh toán và vận chuyển riêng. Tận dụng chuyên môn: VNPay và GHN là các đơn vị chuyên nghiệp với hệ thống ổn định và bảo mật cao. Tăng độ tin cậy: người dùng tin tưởng hơn khi thanh toán qua cổng thanh toán uy tín. Mở rộng phương thức thanh toán: VNPay hỗ trợ nhiều phương thức mà hệ thống không thể tự triển khai. Mạng lưới vận chuyển rộng: GHN có mạng lưới toàn quốc, đảm bảo giao hàng nhanh chóng.


# PHẦN 5: THIẾT KẾ CHI TIẾT

## 5.1. Thiết kế cơ sở dữ liệu

Cơ sở dữ liệu là nền tảng của hệ thống, lưu trữ tất cả thông tin quan trọng và đảm bảo tính toàn vẹn dữ liệu. Thiết kế database của ToyStore tuân thủ các nguyên tắc chuẩn hóa và tối ưu hóa để đảm bảo hiệu suất và khả năng mở rộng.

### 5.1.1. Mô hình quan hệ (ERD)

Hệ thống ToyStore sử dụng mô hình cơ sở dữ liệu quan hệ (Relational Database Model) với 21 bảng chính, được tổ chức thành các nhóm chức năng rõ ràng.

**Nhóm quản lý người dùng**

Bảng TaiKhoan lưu trữ thông tin đăng nhập với các trường: MaTK (primary key), TenDangNhap, Email (unique), MatKhau (đã mã hóa), VaiTro (user/admin/staff), TrangThai (active/inactive), NgayTao, NgayCapNhat. Bảng KhachHang lưu thông tin chi tiết khách hàng với các trường: MaKH (primary key), TaiKhoanID (foreign key), HoTen, SoDienThoai, NgaySinh, GioiTinh, DiaChi. Quan hệ giữa TaiKhoan và KhachHang là một-một, mỗi tài khoản tương ứng với một khách hàng.

**Nhóm quản lý sản phẩm**

Bảng SanPham lưu thông tin sản phẩm: MaSP (primary key), TenSP, MoTa, Gia, SoLuongTonKho, LoaiID (foreign key), ThuongHieuID (foreign key), DoTuoiPhuHop, HinhAnh, TrangThai, NgayTao. Bảng LoaiSP lưu danh mục sản phẩm: MaLoai (primary key), TenLoai, MoTa. Bảng ThuongHieu lưu thông tin thương hiệu: MaThuongHieu (primary key), TenThuongHieu, MoTa. Bảng SanPhamHinhAnh lưu nhiều hình ảnh cho một sản phẩm: MaHinhAnh (primary key), SanPhamID (foreign key), DuongDan, ThuTu, LaMacDinh.

**Nhóm quản lý giỏ hàng**

Bảng GioHang lưu thông tin giỏ hàng: MaGioHang (primary key), TaiKhoanID (foreign key), NgayTao, NgayCapNhat. Bảng GioHangChiTiet lưu chi tiết sản phẩm trong giỏ: MaGioHangChiTiet (primary key), GioHangID (foreign key), SanPhamID (foreign key), SoLuong, NgayThem. Bảng GioHangKhachVangLai lưu giỏ hàng cho khách chưa đăng nhập: MaGioHangKV (primary key), SessionID, SanPhamID (foreign key), SoLuong, NgayThem, NgayHetHan.

**Nhóm quản lý đơn hàng**

Bảng HoaDon lưu thông tin đơn hàng: MaHD (primary key), KhachHangID (foreign key), TongTien, TienGoc, TienVAT, TyLeVAT, MaVoucher, TienGiamGia, PhiVanChuyen, MiemPhiVanChuyen, TrangThai, PhuongThucThanhToanID (foreign key), TrangThaiThanhToan, NgayDat, NgayCapNhat. Bảng ChiTietHoaDon lưu chi tiết sản phẩm trong đơn: MaCTHD (primary key), HoaDonID (foreign key), SanPhamID (foreign key), SoLuong, DonGia, ThanhTien. Bảng PhuongThucThanhToan lưu các phương thức thanh toán: MaPTTT (primary key), TenPTTT, MoTa.

**Nhóm quản lý voucher**

Bảng Voucher lưu thông tin voucher: MaVoucher (primary key), Code (unique), LoaiGiamGia (percent/fixed), GiaTriGiam, GiaTriDonHangToiThieu, SoLuong, SoLuongDaSuDung, NgayBatDau, NgayKetThuc, TrangThai. Bảng LichSuSuDungVoucher lưu lịch sử sử dụng: MaLichSu (primary key), VoucherID (foreign key), TaiKhoanID (foreign key), HoaDonID (foreign key), NgaySuDung.

**Nhóm quản lý địa chỉ và vận chuyển**

Bảng DiaChiGiaoHangUser lưu địa chỉ đã lưu của người dùng: MaDiaChi (primary key), TaiKhoanID (foreign key), TenNguoiNhan, SoDienThoai, DiaChiChiTiet, PhuongXa, QuanHuyen, TinhThanhPho, LaMacDinh. Bảng DiaChiGiaoHang lưu địa chỉ cho từng đơn hàng: MaDCGH (primary key), HoaDonID (foreign key), TenNguoiNhan, SoDienThoai, DiaChiChiTiet, PhuongXa, QuanHuyen, TinhThanhPho. Bảng ThongTinVanChuyen lưu thông tin vận chuyển: MaTTVC (primary key), HoaDonID (foreign key), DonViVanChuyen, MaVanDon, TrangThaiVanChuyen, NgayGuiHang, NgayGiaoHangDuKien, NgayGiaoThucTe.

**Nhóm khác**

Bảng DanhGiaSanPham lưu đánh giá: MaDanhGia (primary key), SanPhamID (foreign key), TaiKhoanID (foreign key), DiemDanhGia, NoiDung, NgayDanhGia. Bảng Banner lưu banner quảng cáo: MaBanner (primary key), TieuDe, HinhAnh, Link, ThuTu, TrangThai, NgayBatDau, NgayKetThuc.

### 5.1.2. Danh sách các bảng và quan hệ chi tiết

**Quan hệ một-một (1:1)**

TaiKhoan và KhachHang: Mỗi tài khoản tương ứng với một khách hàng duy nhất. Foreign key TaiKhoanID trong bảng KhachHang tham chiếu đến MaTK trong TaiKhoan. HoaDon và DiaChiGiaoHang: Mỗi đơn hàng có một địa chỉ giao hàng cụ thể. Foreign key HoaDonID trong DiaChiGiaoHang tham chiếu đến MaHD trong HoaDon. HoaDon và ThongTinVanChuyen: Mỗi đơn hàng có thông tin vận chuyển riêng (nếu đã được gửi đi). Foreign key HoaDonID trong ThongTinVanChuyen tham chiếu đến MaHD.

**Quan hệ một-nhiều (1:N)**

TaiKhoan và GioHang: Một tài khoản có một giỏ hàng, giỏ hàng có nhiều sản phẩm thông qua GioHangChiTiet. KhachHang và HoaDon: Một khách hàng có thể có nhiều đơn hàng. Foreign key KhachHangID trong HoaDon tham chiếu đến MaKH. HoaDon và ChiTietHoaDon: Một đơn hàng chứa nhiều sản phẩm. Foreign key HoaDonID trong ChiTietHoaDon tham chiếu đến MaHD. SanPham và ChiTietHoaDon: Một sản phẩm có thể xuất hiện trong nhiều đơn hàng. Foreign key SanPhamID trong ChiTietHoaDon tham chiếu đến MaSP. LoaiSP và SanPham: Một danh mục chứa nhiều sản phẩm. Foreign key LoaiID trong SanPham tham chiếu đến MaLoai. ThuongHieu và SanPham: Một thương hiệu có nhiều sản phẩm. Foreign key ThuongHieuID trong SanPham tham chiếu đến MaThuongHieu. SanPham và SanPhamHinhAnh: Một sản phẩm có nhiều hình ảnh. Foreign key SanPhamID trong SanPhamHinhAnh tham chiếu đến MaSP. Voucher và LichSuSuDungVoucher: Một voucher có thể được sử dụng nhiều lần bởi nhiều người. Foreign key VoucherID trong LichSuSuDungVoucher tham chiếu đến MaVoucher. TaiKhoan và DiaChiGiaoHangUser: Một tài khoản có thể lưu nhiều địa chỉ. Foreign key TaiKhoanID trong DiaChiGiaoHangUser tham chiếu đến MaTK. SanPham và DanhGiaSanPham: Một sản phẩm có nhiều đánh giá. Foreign key SanPhamID trong DanhGiaSanPham tham chiếu đến MaSP. TaiKhoan và DanhGiaSanPham: Một người dùng có thể đánh giá nhiều sản phẩm. Foreign key TaiKhoanID trong DanhGiaSanPham tham chiếu đến MaTK.

### 5.1.3. Chuẩn hóa dữ liệu

Database của ToyStore được thiết kế tuân thủ các dạng chuẩn hóa để đảm bảo tính toàn vẹn dữ liệu và giảm thiểu dư thừa.

**Dạng chuẩn 1 (1NF - First Normal Form)**

Tất cả các bảng đều đạt dạng chuẩn 1NF với các đặc điểm: mỗi bảng có primary key duy nhất, mỗi cột chứa giá trị nguyên tử (atomic), không có nhóm lặp lại, mỗi cột có kiểu dữ liệu nhất quán. Ví dụ, trong bảng SanPham, thay vì lưu nhiều hình ảnh trong một cột (vi phạm 1NF), hệ thống tạo bảng riêng SanPhamHinhAnh để lưu từng hình ảnh.

**Dạng chuẩn 2 (2NF - Second Normal Form)**

Các bảng đạt 2NF khi đã đạt 1NF và không có phụ thuộc hàm một phần (partial dependency). Tất cả các thuộc tính không khóa phụ thuộc hoàn toàn vào khóa chính. Ví dụ, trong bảng ChiTietHoaDon, các thuộc tính SoLuong, DonGia, ThanhTien đều phụ thuộc hoàn toàn vào khóa chính (MaCTHD), không phụ thuộc vào một phần của khóa.

**Dạng chuẩn 3 (3NF - Third Normal Form)**

Các bảng đạt 3NF khi đã đạt 2NF và không có phụ thuộc bắc cầu (transitive dependency). Mọi thuộc tính không khóa phụ thuộc trực tiếp vào khóa chính, không thông qua thuộc tính khác. Ví dụ minh họa chuẩn hóa: thay vì lưu TenLoai và TenThuongHieu trực tiếp trong bảng SanPham (gây dư thừa khi nhiều sản phẩm cùng loại), hệ thống tách thành các bảng LoaiSP và ThuongHieu riêng biệt. SanPham chỉ lưu LoaiID và ThuongHieuID (foreign keys). Trong bảng ChiTietHoaDon, DonGia được lưu tại thời điểm mua hàng thay vì tham chiếu đến SanPham.Gia hiện tại. Điều này đảm bảo giá trong đơn hàng không thay đổi khi giá sản phẩm thay đổi.

**Lợi ích của chuẩn hóa**

Giảm dư thừa dữ liệu: thông tin chỉ được lưu một lần, tiết kiệm không gian lưu trữ. Đảm bảo tính toàn vẹn: cập nhật dữ liệu ở một nơi tự động phản ánh ở mọi nơi sử dụng. Dễ bảo trì: thêm, sửa, xóa dữ liệu đơn giản hơn và ít rủi ro hơn. Tránh anomalies: ngăn chặn các vấn đề khi insert, update, delete dữ liệu.

### 5.1.4. Indexing và tối ưu hóa

Để đảm bảo hiệu suất truy vấn tốt, các index được tạo một cách có chọn lọc.

**Primary key indexes**

Tất cả primary keys tự động có clustered index, đảm bảo truy vấn theo ID nhanh chóng.

**Foreign key indexes**

Các foreign keys được tạo non-clustered index để tối ưu JOIN operations: TaiKhoanID trong KhachHang, KhachHangID trong HoaDon, SanPhamID trong ChiTietHoaDon, LoaiID và ThuongHieuID trong SanPham.

**Search indexes**

Các cột thường được sử dụng trong tìm kiếm được index: Email trong TaiKhoan (unique index), TenSP trong SanPham (full-text index hoặc regular index), Code trong Voucher (unique index).

**Composite indexes**

Một số trường hợp sử dụng composite index cho các truy vấn phức tạp: (GioHangID, SanPhamID) trong GioHangChiTiet, (HoaDonID, SanPhamID) trong ChiTietHoaDon.

## 5.2. Thiết kế giao diện người dùng (UI/UX)

Giao diện người dùng đóng vai trò quan trọng trong trải nghiệm mua sắm trực tuyến. ToyStore được thiết kế với nguyên tắc user-centered design, tập trung vào sự đơn giản, trực quan và hiệu quả.

### 5.2.1. Nguyên tắc thiết kế

**Consistency (Tính nhất quán)**

Giao diện duy trì tính nhất quán về màu sắc, typography, spacing, và layout xuyên suốt toàn bộ ứng dụng. Các thành phần tương tự có cách hiển thị và tương tác giống nhau. Ví dụ, tất cả các nút chính đều có màu xanh, nút phụ có màu xám, nút nguy hiểm có màu đỏ. Các form input đều có cùng style, validation messages hiển thị ở vị trí nhất quán.

**Simplicity (Tính đơn giản)**

Giao diện tránh sự phức tạp không cần thiết, tập trung vào các tính năng cốt lõi. Mỗi trang có một mục đích rõ ràng và hướng dẫn người dùng đến hành động tiếp theo. Quy trình mua hàng được thiết kế với số bước tối thiểu: duyệt sản phẩm, thêm vào giỏ, checkout, thanh toán. Navigation menu được tổ chức theo cấu trúc phân cấp rõ ràng, dễ tìm kiếm.

**Responsive Design (Thiết kế đáp ứng)**

Giao diện tự động điều chỉnh layout dựa trên kích thước màn hình. Desktop (≥1024px): hiển thị nhiều cột, sidebar navigation, nhiều sản phẩm trên một hàng. Tablet (768px-1023px): giảm số cột, điều chỉnh spacing, ẩn một số thông tin phụ. Mobile (<768px): hiển thị một cột, hamburger menu, tối ưu cho thao tác chạm. Hình ảnh sử dụng responsive images với srcset để load kích thước phù hợp.

**Accessibility (Khả năng tiếp cận)**

Giao diện tuân thủ các nguyên tắc accessibility cơ bản: sử dụng semantic HTML (header, nav, main, footer, article), cung cấp alt text cho tất cả hình ảnh, đảm bảo contrast ratio tối thiểu 4.5:1 cho text, hỗ trợ keyboard navigation, sử dụng ARIA labels khi cần thiết.

**Feedback (Phản hồi)**

Hệ thống cung cấp feedback tức thì cho mọi thao tác của người dùng: loading indicators khi đang xử lý request, success messages khi thao tác thành công (màu xanh), error messages khi có lỗi (màu đỏ), confirmation dialogs cho các thao tác quan trọng (xóa, hủy đơn hàng).

### 5.2.2. Các màn hình chính

**Trang chủ (Homepage)**

Trang chủ là điểm tiếp xúc đầu tiên với người dùng, được thiết kế để tạo ấn tượng tốt và hướng dẫn người dùng khám phá sản phẩm. Header chứa logo, search bar, navigation menu, giỏ hàng icon, user menu. Banner carousel hiển thị các chương trình khuyến mãi, sản phẩm nổi bật. Danh mục sản phẩm với icons và tên rõ ràng. Sản phẩm mới nhất hiển thị dưới dạng grid. Sản phẩm bán chạy với badge "Best Seller". Footer chứa thông tin liên hệ, chính sách, social media links.

**Trang danh sách sản phẩm (Product List)**

Trang này cho phép người dùng duyệt và lọc sản phẩm. Sidebar (desktop) hoặc filter drawer (mobile) chứa các bộ lọc: danh mục, thương hiệu, khoảng giá (slider), độ tuổi phù hợp. Toolbar chứa: số lượng sản phẩm tìm thấy, dropdown sắp xếp (mới nhất, giá tăng/giảm, bán chạy), view mode (grid/list). Product grid hiển thị: hình ảnh sản phẩm, tên, giá, rating, nút "Thêm vào giỏ". Pagination ở cuối trang với số trang và nút previous/next.

**Trang chi tiết sản phẩm (Product Detail)**

Trang này cung cấp thông tin đầy đủ về sản phẩm. Image gallery với ảnh chính lớn và thumbnails, hỗ trợ zoom và lightbox. Thông tin sản phẩm: tên, giá, rating với số lượt đánh giá, mô tả ngắn, danh mục và thương hiệu, độ tuổi phù hợp. Quantity selector và nút "Thêm vào giỏ hàng" lớn, nổi bật. Tabs chứa: mô tả chi tiết, thông số kỹ thuật, đánh giá khách hàng. Section sản phẩm liên quan ở cuối trang.

**Trang giỏ hàng (Shopping Cart)**

Trang giỏ hàng hiển thị các sản phẩm đã chọn và cho phép điều chỉnh. Bảng hoặc danh sách sản phẩm với: hình ảnh nhỏ, tên sản phẩm (link đến chi tiết), giá đơn vị, quantity selector (có validation tồn kho), thành tiền, nút xóa. Summary box hiển thị: tạm tính, số lượng sản phẩm, nút "Tiếp tục mua sắm" và "Thanh toán". Empty cart state với icon và message khuyến khích mua sắm.

**Trang thanh toán (Checkout)**

Trang checkout được thiết kế theo multi-step form hoặc single page với sections rõ ràng. Section địa chỉ giao hàng: chọn từ địa chỉ đã lưu hoặc nhập mới, form validation real-time. Section voucher: input để nhập mã, nút "Áp dụng", hiển thị voucher đã áp dụng. Section tóm tắt đơn hàng: danh sách sản phẩm (compact), breakdown giá (tạm tính, VAT, giảm giá, phí ship, tổng cộng). Section phương thức thanh toán: radio buttons cho các phương thức, hiện tại chỉ VNPay. Nút "Đặt hàng" lớn, nổi bật với loading state khi processing.

**Trang lịch sử đơn hàng (Order History)**

Trang này cho phép người dùng xem và quản lý đơn hàng. Tabs hoặc filter theo trạng thái: tất cả, chờ xử lý, đang giao, đã giao, đã hủy. Danh sách đơn hàng với: mã đơn hàng, ngày đặt, tổng tiền, trạng thái (với màu sắc khác nhau), nút "Xem chi tiết". Trang chi tiết đơn hàng hiển thị: thông tin đầy đủ, timeline trạng thái, danh sách sản phẩm, địa chỉ giao hàng, thông tin thanh toán, breakdown giá, nút "Hủy đơn" (nếu cho phép).

**Admin Dashboard**

Dashboard cung cấp tổng quan về hoạt động kinh doanh. Cards hiển thị metrics chính: doanh thu hôm nay/tháng này, số đơn hàng, số khách hàng mới, sản phẩm bán chạy. Biểu đồ doanh thu theo thời gian (line chart hoặc bar chart). Bảng đơn hàng mới nhất cần xử lý. Bảng sản phẩm sắp hết hàng. Quick actions: thêm sản phẩm, xem đơn hàng, tạo voucher.

**Admin quản lý sản phẩm**

Trang này cho phép admin quản lý toàn bộ sản phẩm. Toolbar với: nút "Thêm sản phẩm mới", search box, filter theo danh mục/thương hiệu/trạng thái. Bảng sản phẩm với columns: hình ảnh, tên, giá, tồn kho, danh mục, trạng thái, actions (sửa, xóa). Pagination và số lượng hiển thị per page. Form thêm/sửa sản phẩm với: các input fields, upload nhiều hình ảnh với preview, rich text editor cho mô tả, validation đầy đủ.

## 5.3. Thiết kế API

API là cầu nối giữa frontend và backend, được thiết kế theo chuẩn RESTful để đảm bảo tính nhất quán và dễ sử dụng.

### 5.3.1. Nguyên tắc RESTful API Design

**Sử dụng HTTP methods đúng ngữ nghĩa**

GET: lấy dữ liệu, không thay đổi state của server, có thể cache. POST: tạo resource mới, thay đổi state, không idempotent. PUT: cập nhật toàn bộ resource, idempotent. PATCH: cập nhật một phần resource, idempotent. DELETE: xóa resource, idempotent.

**URL rõ ràng và có cấu trúc**

Sử dụng danh từ số nhiều cho resources: /api/products, /api/orders, /api/users. Sử dụng ID để truy cập resource cụ thể: /api/products/123. Sử dụng nested resources khi có quan hệ rõ ràng: /api/orders/456/items. Tránh động từ trong URL, sử dụng HTTP methods thay thế: GET /api/products thay vì /api/getProducts.

**Response format nhất quán**

Tất cả responses đều là JSON với cấu trúc nhất quán. Success response bao gồm: success (boolean), data (object hoặc array), message (optional). Error response bao gồm: success (false), error (object với code và message), details (optional, cho validation errors). Pagination response bao gồm: data (array), pagination (object với page, limit, total, totalPages).

**Status codes phù hợp**

200 OK: request thành công, có data trả về. 201 Created: resource mới được tạo thành công. 204 No Content: request thành công, không có data trả về (ví dụ DELETE). 400 Bad Request: request không hợp lệ (validation error). 401 Unauthorized: chưa authenticate hoặc token không hợp lệ. 403 Forbidden: đã authenticate nhưng không có quyền. 404 Not Found: resource không tồn tại. 500 Internal Server Error: lỗi server.

### 5.3.2. Authentication và Authorization

**JWT (JSON Web Token) Authentication**

Hệ thống sử dụng JWT cho stateless authentication. Quy trình đăng nhập: người dùng gửi email và password đến /api/auth/login. Server xác thực thông tin, nếu đúng tạo JWT token chứa payload (userId, email, role, exp). Token được ký bằng secret key và trả về cho client. Client lưu token trong localStorage và gửi kèm trong header Authorization: Bearer <token> cho các request sau.

**Middleware xác thực**

Mọi API endpoint cần authentication đều đi qua auth middleware. Middleware lấy token từ header Authorization. Verify token sử dụng secret key, kiểm tra expiration. Nếu hợp lệ, decode token để lấy thông tin user và gắn vào req.user. Nếu không hợp lệ, trả về 401 Unauthorized.

**Role-Based Access Control (RBAC)**

Hệ thống có ba vai trò: user (khách hàng), staff (nhân viên), admin (quản trị viên). Authorization middleware kiểm tra req.user.role. Các endpoint admin chỉ cho phép role admin. Các endpoint staff cho phép role staff và admin. Các endpoint user cho phép tất cả authenticated users.

### 5.3.3. Ví dụ API endpoints

**Authentication endpoints**

POST /api/auth/register: đăng ký tài khoản mới. Request body: email, password, hoTen, soDienThoai. Response: token, user info. POST /api/auth/login: đăng nhập. Request body: email, password. Response: token, user info. GET /api/auth/me: lấy thông tin user hiện tại. Headers: Authorization. Response: user info. POST /api/auth/logout: đăng xuất (optional, chủ yếu xóa token ở client).

**Product endpoints**

GET /api/products: lấy danh sách sản phẩm. Query params: page, limit, search, filter, minPrice, maxPrice, categoryId, brandId. Response: products array, pagination info. GET /api/products/:id: lấy chi tiết sản phẩm. Response: product object với includes (loaiSP, thuongHieu, hinhAnhs, danhGias). POST /api/admin/products: tạo sản phẩm mới (admin only). Request body: tenSP, moTa, gia, soLuongTonKho, loaiID, thuongHieuID. Response: created product. PUT /api/admin/products/:id: cập nhật sản phẩm (admin only). Request body: các trường cần update. Response: updated product. DELETE /api/admin/products/:id: xóa sản phẩm (admin only, soft delete). Response: success message.

**Cart endpoints**

GET /api/cart: lấy giỏ hàng của user hiện tại. Response: cart với chiTiet (products). POST /api/cart/add: thêm sản phẩm vào giỏ. Request body: sanPhamID, soLuong. Response: updated cart. PUT /api/cart/update/:id: cập nhật số lượng sản phẩm trong giỏ. Request body: soLuong. Response: updated cart. DELETE /api/cart/remove/:id: xóa sản phẩm khỏi giỏ. Response: updated cart. DELETE /api/cart/clear: xóa toàn bộ giỏ hàng. Response: success message.

**Order endpoints**

POST /api/orders/create: tạo đơn hàng từ giỏ hàng. Request body: diaChiGiaoHang, maVoucher (optional). Response: created order với paymentUrl (VNPay). GET /api/orders/my-orders: lấy lịch sử đơn hàng của user. Query params: page, limit, status. Response: orders array, pagination. GET /api/orders/:id: lấy chi tiết đơn hàng. Response: order với chiTiet, diaChiGiaoHang, thongTinVanChuyen. PUT /api/orders/:id/cancel: hủy đơn hàng (chỉ khi status = "Chờ xử lý"). Response: updated order. GET /api/admin/orders: lấy tất cả đơn hàng (admin/staff). Query params: page, limit, status, customerId. Response: orders array, pagination. PUT /api/admin/orders/:id/status: cập nhật trạng thái đơn hàng (admin/staff). Request body: trangThai. Response: updated order.

**Payment endpoints**

GET /api/payment/vnpay/create-payment-url: tạo URL thanh toán VNPay. Query params: orderId, amount, bankCode (optional). Response: paymentUrl. GET /api/payment/vnpay/return: xử lý callback từ VNPay. Query params: các params từ VNPay. Response: redirect đến success/error page. POST /api/payment/vnpay/ipn: nhận IPN từ VNPay. Request body: các params từ VNPay. Response: confirmation cho VNPay.

## 5.4. Áp dụng Design Patterns

Design Patterns giúp giải quyết các vấn đề thiết kế phổ biến một cách hiệu quả và có cấu trúc. ToyStore áp dụng ba patterns chính: Decorator, Strategy và Singleton.

### 5.4.1. Decorator Pattern - Tính giá đơn hàng

**Vấn đề cần giải quyết**

Tính giá đơn hàng trong thương mại điện tử là một bài toán phức tạp với nhiều thành phần: giá gốc của sản phẩm, thuế VAT, giảm giá từ voucher, phí vận chuyển (có thể miễn phí), các chương trình khuyến mãi khác. Nếu sử dụng một hàm tính toán duy nhất với nhiều if-else, code sẽ trở nên phức tạp, khó đọc và khó mở rộng khi cần thêm thành phần giá mới.

**Giải pháp với Decorator Pattern**

Decorator Pattern cho phép thêm các tính năng mới vào object một cách động mà không cần thay đổi cấu trúc của object gốc. Trong ToyStore, mỗi thành phần giá được triển khai như một decorator riêng biệt, có thể kết hợp linh hoạt.

**Cấu trúc implementation**

Base Component là OrderPriceCalculator, nhận danh sách sản phẩm và tính tổng tiền gốc. Base Decorator là OrderPriceDecorator, là abstract class định nghĩa interface chung cho các decorators. Concrete Decorators bao gồm: VATDecorator thêm thuế VAT, VoucherDecorator trừ giảm giá từ voucher, ShippingDecorator thêm phí vận chuyển hoặc miễn phí.

**Code implementation chi tiết**

OrderPriceCalculator (Base Component) có constructor nhận items (danh sách sản phẩm), method calculate() tính tổng tiền gốc bằng cách sum(item.donGia * item.soLuong), method getDetails() trả về object chứa tongTienSanPham và items.

OrderPriceDecorator (Base Decorator) có constructor nhận calculator (component hoặc decorator khác), abstract method calculate() bắt buộc override, abstract method getDetails() bắt buộc override.

VATDecorator extends OrderPriceDecorator với constructor nhận calculator và vatRate (mặc định 0.1), calculate() gọi calculator.calculate() để lấy subtotal, tính VAT = subtotal * vatRate, trả về subtotal + VAT. getDetails() gọi calculator.getDetails(), thêm thông tin VAT vào result, trả về object đầy đủ.

VoucherDecorator extends OrderPriceDecorator với constructor nhận calculator và voucher object (code, type, value, maxDiscount), calculate() gọi calculator.calculate(), tính discount dựa trên voucher type (percent hoặc fixed), áp dụng maxDiscount nếu có, trả về subtotal - discount. getDetails() tương tự VATDecorator, thêm thông tin voucher.

ShippingDecorator extends OrderPriceDecorator với constructor nhận calculator, shippingFee, freeShippingThreshold (mặc định 500000), calculate() gọi calculator.calculate(), kiểm tra nếu subtotal >= freeShippingThreshold thì miễn phí, ngược lại thêm shippingFee, trả về total. getDetails() thêm thông tin shipping.

**Cách sử dụng trong OrderService**

Tạo base calculator với danh sách sản phẩm: let calculator = new OrderPriceCalculator(items). Wrap với VATDecorator: calculator = new VATDecorator(calculator, 0.1). Nếu có voucher, wrap với VoucherDecorator: calculator = new VoucherDecorator(calculator, voucher). Wrap với ShippingDecorator: calculator = new ShippingDecorator(calculator, shippingFee, 500000). Gọi calculate() để lấy tổng tiền cuối: const tongTien = calculator.calculate(). Gọi getDetails() để lấy breakdown chi tiết: const details = calculator.getDetails(). Lưu các giá trị vào database: TienGoc, TienVAT, TienGiamGia, PhiVanChuyen, TongTien.

**Lợi ích của Decorator Pattern**

Open/Closed Principle: mở cho mở rộng (thêm decorator mới), đóng cho sửa đổi (không cần sửa code cũ). Single Responsibility: mỗi decorator chỉ lo một việc (VAT, voucher, shipping). Flexibility: có thể bật/tắt từng decorator, thay đổi thứ tự dễ dàng. Testability: test từng decorator độc lập, dễ mock dependencies. Maintainability: code rõ ràng, dễ đọc, dễ debug.

### 5.4.2. Strategy Pattern - Lọc và sắp xếp sản phẩm

**Vấn đề cần giải quyết**

Người dùng cần nhiều cách sắp xếp sản phẩm khác nhau: mới nhất, giá tăng dần, giá giảm dần, bán chạy nhất, đánh giá cao nhất. Nếu sử dụng if-else hoặc switch-case trong controller, code sẽ dài dòng, khó bảo trì và vi phạm Open/Closed Principle khi cần thêm cách sắp xếp mới.

**Giải pháp với Strategy Pattern**

Strategy Pattern định nghĩa một họ các thuật toán, đóng gói từng thuật toán thành class riêng, và làm cho chúng có thể thay thế lẫn nhau. Client có thể chọn thuật toán phù hợp tại runtime mà không cần biết chi tiết implementation.

**Cấu trúc implementation**

Strategy Interface là ProductFilterStrategy, định nghĩa method filter(products, query). Concrete Strategies bao gồm: NewestStrategy sắp xếp theo ngày tạo giảm dần, PriceAscendingStrategy sắp xếp theo giá tăng dần, PriceDescendingStrategy sắp xếp theo giá giảm dần, BestSellerStrategy sắp xếp theo số lượng bán giảm dần. Context là FilterContext, quản lý strategies và chọn strategy phù hợp.

**Code implementation chi tiết**

ProductFilterStrategy (Base Class) có method filter(products, query) throw error bắt buộc override, helper method filterByPriceRange(products, minPrice, maxPrice) lọc sản phẩm theo khoảng giá, helper method filterByCategory(products, categoryId) lọc theo danh mục.

NewestStrategy extends ProductFilterStrategy với filter(products, query) clone array để tránh mutate, gọi filterByPriceRange và filterByCategory, sort theo createdAt giảm dần (mới nhất trước), trả về filtered array.

PriceAscendingStrategy extends ProductFilterStrategy với filter(products, query) tương tự NewestStrategy nhưng sort theo Gia tăng dần: (a, b) => parseFloat(a.Gia) - parseFloat(b.Gia).

PriceDescendingStrategy extends ProductFilterStrategy với filter(products, query) sort theo Gia giảm dần: (a, b) => parseFloat(b.Gia) - parseFloat(a.Gia).

BestSellerStrategy extends ProductFilterStrategy với filter(products, query) clone và lọc cơ bản, map products để thêm totalSold (tính từ ChiTietHoaDons), sort theo totalSold giảm dần, trả về products với totalSold.

FilterContext (Context Class) có constructor khởi tạo strategies registry: this.strategies = { newest: new NewestStrategy(), priceAsc: new PriceAscendingStrategy(), priceDesc: new PriceDescendingStrategy(), bestSeller: new BestSellerStrategy() }. Method applyFilter(products, filterType, queryParams) gọi getStrategy(filterType), gọi strategy.filter(products, queryParams), trả về kết quả. Method getStrategy(filterType) tra cứu trong strategies registry, trả về strategy hoặc default strategy. Method getAvailableFilters() trả về Object.keys(this.strategies).

**Cách sử dụng trong ProductController**

Lấy filterType từ query params: const filterType = req.query.filter || 'newest'. Lấy các query params khác: minPrice, maxPrice, categoryId. Query database lấy products với includes cần thiết. Convert Sequelize models sang plain objects: const plainProducts = products.map(p => p.toJSON()). Gọi FilterContext: const filtered = FilterContext.applyFilter(plainProducts, filterType, { minPrice, maxPrice, categoryId }). Áp dụng pagination trên filtered results. Trả về response với products và filter info.

**Lợi ích của Strategy Pattern**

Loại bỏ if-else hell: không cần if-else dài để chọn thuật toán. Open/Closed Principle: thêm strategy mới không cần sửa code cũ. Single Responsibility: mỗi strategy chỉ lo một cách sắp xếp. Testability: test từng strategy độc lập. Reusability: strategies có thể dùng ở nhiều nơi khác nhau.

### 5.4.3. Singleton Pattern - Quản lý tài nguyên

**Vấn đề cần giải quyết**

Một số đối tượng trong hệ thống chỉ nên có một instance duy nhất: database connection pool (tránh tạo nhiều connection không cần thiết), logger (đảm bảo log nhất quán), config service (đọc config một lần duy nhất). Nếu tạo nhiều instances, sẽ lãng phí tài nguyên và có thể gây inconsistency.

**Giải pháp với Singleton Pattern**

Singleton Pattern đảm bảo một class chỉ có một instance duy nhất và cung cấp một điểm truy cập global đến instance đó.

**Implementation DBConnection Singleton**

Class DBConnection có static property instance = null lưu instance duy nhất, private constructor để ngăn tạo instance từ bên ngoài, property sequelize lưu Sequelize instance. Static method getInstance() kiểm tra nếu instance === null thì tạo mới, ngược lại trả về instance hiện có. Method getSequelize() trả về sequelize instance. Method connect() thiết lập kết nối database. Method close() đóng kết nối.

Cách sử dụng: const dbConnection = DBConnection.getInstance(), const sequelize = dbConnection.getSequelize(). Mọi nơi trong ứng dụng gọi getInstance() đều nhận được cùng một instance.

**Implementation Logger Singleton**

Class Logger có static instance, private constructor, method log(level, message) ghi log với format nhất quán, method info(message), error(message), warn(message), debug(message). Static getInstance() trả về instance duy nhất.

Cách sử dụng: const logger = Logger.getInstance(), logger.info('Server started'), logger.error('Database connection failed').

**Implementation ConfigService Singleton**

Class ConfigService có static instance, private constructor, property config lưu configuration object, method loadConfig() đọc từ .env hoặc config files, method getValue(section, key) lấy giá trị config. Static getInstance() trả về instance duy nhất.

Cách sử dụng: const config = ConfigService.getInstance(), const dbHost = config.getValue('database', 'host'), const port = config.getValue('server', 'port').

**Lợi ích của Singleton Pattern**

Tiết kiệm tài nguyên: chỉ tạo một instance, tránh lãng phí memory. Đảm bảo tính nhất quán: mọi nơi sử dụng cùng một instance, cùng một state. Global access: dễ dàng truy cập từ mọi nơi trong ứng dụng. Thread-safe: trong Node.js single-threaded, không cần lo lắng về concurrency issues. Lazy initialization: instance chỉ được tạo khi cần (lần đầu gọi getInstance()).

**Lưu ý khi sử dụng Singleton**

Tránh lạm dụng: không phải mọi class đều nên là Singleton. Chỉ dùng cho các đối tượng thực sự cần duy nhất: database connection, logger, config. Testing: Singleton có thể gây khó khăn cho unit testing do global state, cần cẩn thận khi test. Dependency injection: trong một số trường hợp, dependency injection có thể là lựa chọn tốt hơn Singleton.


# PHẦN 6: UML DIAGRAMS

UML (Unified Modeling Language) là ngôn ngữ mô hình hóa chuẩn được sử dụng rộng rãi trong phát triển phần mềm để trực quan hóa, đặc tả, xây dựng và tài liệu hóa các thành phần của hệ thống phần mềm. Phần này trình bày các biểu đồ UML chính của hệ thống ToyStore, giúp hiểu rõ hơn về cấu trúc, hành vi và tương tác giữa các thành phần.

## 6.1. Use Case Diagram

Use Case Diagram mô tả các chức năng của hệ thống từ góc nhìn người dùng, cho thấy các actors (người dùng hoặc hệ thống bên ngoài) và các use cases (chức năng) mà họ có thể thực hiện.

### 6.1.1. Actors trong hệ thống

**Customer (Khách hàng)**: Người dùng cuối sử dụng hệ thống để mua sắm đồ chơi. Bao gồm cả khách đã đăng ký và khách vãng lai.

**Admin (Quản trị viên)**: Người quản lý toàn bộ hệ thống, có quyền cao nhất để quản lý sản phẩm, đơn hàng, người dùng và xem báo cáo.

**Staff (Nhân viên)**: Người hỗ trợ xử lý đơn hàng và chăm sóc khách hàng, có quyền hạn trung gian.

**VNPay System**: Hệ thống thanh toán bên ngoài, xử lý các giao dịch thanh toán trực tuyến.

**GHN System**: Hệ thống vận chuyển bên ngoài, quản lý việc giao hàng.

### 6.1.2. Use Cases chính

**Nhóm Authentication và User Management**

Đăng ký tài khoản: Customer tạo tài khoản mới trong hệ thống. Đăng nhập: Customer, Admin, Staff đăng nhập vào hệ thống. Quản lý thông tin cá nhân: Customer cập nhật thông tin profile. Quản lý địa chỉ giao hàng: Customer thêm, sửa, xóa địa chỉ.

**Nhóm Product Management**

Xem danh sách sản phẩm: Customer duyệt các sản phẩm có sẵn. Tìm kiếm sản phẩm: Customer tìm kiếm sản phẩm theo từ khóa. Lọc và sắp xếp sản phẩm: Customer áp dụng bộ lọc và sắp xếp. Xem chi tiết sản phẩm: Customer xem thông tin đầy đủ về sản phẩm. Đánh giá sản phẩm: Customer viết đánh giá cho sản phẩm đã mua. Quản lý sản phẩm (CRUD): Admin thêm, sửa, xóa sản phẩm.

**Nhóm Shopping Cart**

Thêm vào giỏ hàng: Customer thêm sản phẩm vào giỏ. Xem giỏ hàng: Customer xem các sản phẩm trong giỏ. Cập nhật giỏ hàng: Customer thay đổi số lượng hoặc xóa sản phẩm.

**Nhóm Order Management**

Đặt hàng: Customer tạo đơn hàng từ giỏ hàng. Áp dụng voucher: Customer sử dụng mã giảm giá. Thanh toán: Customer thanh toán qua VNPay (include VNPay System). Xem lịch sử đơn hàng: Customer xem các đơn hàng đã đặt. Xem chi tiết đơn hàng: Customer xem thông tin chi tiết đơn hàng. Hủy đơn hàng: Customer hủy đơn hàng đang chờ xử lý. Quản lý đơn hàng: Admin/Staff xem và cập nhật trạng thái đơn hàng. Tạo đơn vận chuyển: Admin/Staff tạo đơn vận chuyển trên GHN (include GHN System).

**Nhóm Admin Functions**

Quản lý người dùng: Admin xem, vô hiệu hóa, thay đổi vai trò người dùng. Quản lý voucher: Admin tạo và quản lý các voucher. Xem thống kê: Admin xem báo cáo doanh thu và các chỉ số. Quản lý danh mục và thương hiệu: Admin quản lý categories và brands.

### 6.1.3. Relationships trong Use Case Diagram

**Include relationships**: Đặt hàng include Thanh toán (không thể đặt hàng mà không thanh toán). Thanh toán include Xử lý thanh toán VNPay. Tạo đơn vận chuyển include Tích hợp GHN API.

**Extend relationships**: Đặt hàng extend Áp dụng voucher (có thể đặt hàng mà không dùng voucher). Xem danh sách sản phẩm extend Lọc và sắp xếp sản phẩm.

**Generalization**: Admin và Staff là specialization của User (kế thừa các use cases cơ bản).

## 6.2. Class Diagram

Class Diagram mô tả cấu trúc tĩnh của hệ thống, bao gồm các classes, attributes, methods và relationships giữa chúng.

### 6.2.1. Model Classes (Database Entities)

**TaiKhoan**: Attributes: MaTK, TenDangNhap, Email, MatKhau, VaiTro, TrangThai, NgayTao. Methods: hashPassword(), verifyPassword(), generateToken(). Relationships: hasOne KhachHang, hasMany DiaChiGiaoHangUser, hasMany DanhGiaSanPham.

**KhachHang**: Attributes: MaKH, TaiKhoanID, HoTen, SoDienThoai, NgaySinh, GioiTinh. Relationships: belongsTo TaiKhoan, hasMany HoaDon.

**SanPham**: Attributes: MaSP, TenSP, MoTa, Gia, SoLuongTonKho, LoaiID, ThuongHieuID. Relationships: belongsTo LoaiSP, belongsTo ThuongHieu, hasMany SanPhamHinhAnh, hasMany ChiTietHoaDon, hasMany DanhGiaSanPham.

**LoaiSP**: Attributes: MaLoai, TenLoai, MoTa. Relationships: hasMany SanPham.

**ThuongHieu**: Attributes: MaThuongHieu, TenThuongHieu, MoTa. Relationships: hasMany SanPham.

**GioHang**: Attributes: MaGioHang, TaiKhoanID, NgayTao. Relationships: belongsTo TaiKhoan, hasMany GioHangChiTiet.

**GioHangChiTiet**: Attributes: MaGioHangChiTiet, GioHangID, SanPhamID, SoLuong. Relationships: belongsTo GioHang, belongsTo SanPham.

**HoaDon**: Attributes: MaHD, KhachHangID, TongTien, TienGoc, TienVAT, TienGiamGia, PhiVanChuyen, TrangThai. Relationships: belongsTo KhachHang, hasMany ChiTietHoaDon, hasOne DiaChiGiaoHang, hasOne ThongTinVanChuyen, belongsTo Voucher.

**ChiTietHoaDon**: Attributes: MaCTHD, HoaDonID, SanPhamID, SoLuong, DonGia, ThanhTien. Relationships: belongsTo HoaDon, belongsTo SanPham.

**Voucher**: Attributes: MaVoucher, Code, LoaiGiamGia, GiaTriGiam, NgayBatDau, NgayKetThuc. Relationships: hasMany HoaDon, hasMany LichSuSuDungVoucher.

### 6.2.2. Controller Classes

**AuthController**: Methods: register(), login(), logout(), getMe(), updateProfile().

**ProductController**: Methods: getAllProducts(), getProductById(), searchProducts(), getProductsByCategory().

**CartController**: Methods: getCart(), addToCart(), updateCartItem(), removeFromCart(), clearCart().

**OrderController**: Methods: createOrder(), getMyOrders(), getOrderById(), cancelOrder().

**AdminProductController**: Methods: createProduct(), updateProduct(), deleteProduct(), getAllProducts().

**AdminOrderController**: Methods: getAllOrders(), updateOrderStatus(), createShippingOrder().

### 6.2.3. Service Classes

**OrderService**: Methods: createOrder(), calculatePrice(), updateStock(), sendConfirmationEmail(). Dependencies: uses OrderPriceCalculator, PaymentService, EmailService.

**PaymentService**: Methods: createVNPayUrl(), handleVNPayReturn(), handleVNPayIPN(). Dependencies: uses VNPay API.

**GHNService**: Methods: createShippingOrder(), getOrderStatus(), calculateShippingFee(). Dependencies: uses GHN API.

**AddressService**: Methods: getUserAddresses(), createAddress(), updateAddress(), deleteAddress().

### 6.2.4. Design Pattern Classes

**OrderPriceCalculator (Component)**: Attributes: items. Methods: calculate(), getDetails().

**OrderPriceDecorator (Decorator)**: Attributes: calculator. Methods: calculate(), getDetails() (abstract).

**VATDecorator extends OrderPriceDecorator**: Attributes: vatRate. Methods: calculate(), getDetails().

**VoucherDecorator extends OrderPriceDecorator**: Attributes: voucher. Methods: calculate(), getDetails().

**ShippingDecorator extends OrderPriceDecorator**: Attributes: shippingFee, freeShippingThreshold. Methods: calculate(), getDetails().

**ProductFilterStrategy (Strategy Interface)**: Methods: filter(products, query) (abstract), filterByPriceRange(), filterByCategory().

**NewestStrategy extends ProductFilterStrategy**: Methods: filter(products, query).

**PriceAscendingStrategy extends ProductFilterStrategy**: Methods: filter(products, query).

**BestSellerStrategy extends ProductFilterStrategy**: Methods: filter(products, query).

**FilterContext (Context)**: Attributes: strategies. Methods: applyFilter(), getStrategy(), getAvailableFilters().

**DBConnection (Singleton)**: Attributes: instance (static), sequelize. Methods: getInstance() (static), getSequelize(), connect(), close().

**Logger (Singleton)**: Attributes: instance (static). Methods: getInstance() (static), log(), info(), error(), warn().

### 6.2.5. Relationships giữa các classes

**Inheritance**: VATDecorator, VoucherDecorator, ShippingDecorator kế thừa OrderPriceDecorator. NewestStrategy, PriceAscendingStrategy, BestSellerStrategy kế thừa ProductFilterStrategy.

**Composition**: FilterContext chứa strategies (composition relationship). OrderPriceDecorator chứa calculator (composition relationship).

**Association**: OrderController sử dụng OrderService. OrderService sử dụng PaymentService, GHNService. ProductController sử dụng FilterContext.

**Dependency**: Controllers phụ thuộc vào Services. Services phụ thuộc vào Models.

## 6.3. Sequence Diagram

Sequence Diagram mô tả tương tác giữa các objects theo thứ tự thời gian, cho thấy luồng xử lý của một use case cụ thể.

### 6.3.1. Sequence Diagram - Luồng đặt hàng

**Participants**: User, Frontend, OrderController, OrderService, CartService, OrderPriceCalculator, VATDecorator, VoucherDecorator, ShippingDecorator, PaymentService, VNPay, Database.

**Luồng xử lý**:

Bước 1: User nhấn nút "Đặt hàng" trên Frontend. Frontend gửi POST request đến OrderController.createOrder() với dữ liệu: diaChiGiaoHang, maVoucher.

Bước 2: OrderController gọi OrderService.createOrder(userId, diaChiGiaoHang, maVoucher). OrderService gọi CartService.getCart(userId) để lấy giỏ hàng. Database trả về cart với chiTiet (sản phẩm).

Bước 3: OrderService kiểm tra tồn kho cho từng sản phẩm. Nếu không đủ hàng, throw error và return. OrderService tạo OrderPriceCalculator với items từ cart.

Bước 4: OrderService wrap calculator với VATDecorator(calculator, 0.1). Nếu có maVoucher, OrderService lấy thông tin voucher từ Database. OrderService wrap với VoucherDecorator(calculator, voucher).

Bước 5: OrderService wrap với ShippingDecorator(calculator, shippingFee, 500000). OrderService gọi calculator.calculate() để lấy tongTien. OrderService gọi calculator.getDetails() để lấy breakdown.

Bước 6: OrderService tạo bản ghi HoaDon trong Database với các thông tin: KhachHangID, TongTien, TienGoc, TienVAT, TienGiamGia, PhiVanChuyen, TrangThai = "Chờ xử lý". Database trả về created order.

Bước 7: OrderService tạo các bản ghi ChiTietHoaDon. OrderService tạo bản ghi DiaChiGiaoHang. Nếu có voucher, tạo LichSuSuDungVoucher.

Bước 8: OrderService gọi PaymentService.createVNPayUrl(orderId, tongTien). PaymentService tạo các tham số VNPay, tạo chữ ký, tạo paymentUrl. PaymentService trả về paymentUrl.

Bước 9: OrderService trả về order và paymentUrl cho OrderController. OrderController trả về response cho Frontend. Frontend redirect User đến VNPay với paymentUrl.

Bước 10: User thực hiện thanh toán trên VNPay. VNPay xử lý giao dịch. VNPay redirect User về returnUrl với kết quả.

Bước 11: Frontend gửi kết quả đến PaymentService.handleReturn(). PaymentService xác thực chữ ký. Nếu thành công, PaymentService cập nhật TrangThaiThanhToan trong Database. PaymentService gọi OrderService.updateStock() để trừ tồn kho. PaymentService trả về kết quả cho Frontend.

Bước 12: Frontend hiển thị trang xác nhận thành công hoặc thất bại cho User.

### 6.3.2. Sequence Diagram - Luồng lọc sản phẩm

**Participants**: User, Frontend, ProductController, FilterContext, Strategy (NewestStrategy/PriceAscendingStrategy/...), Database.

**Luồng xử lý**:

Bước 1: User chọn tiêu chí sắp xếp "Giá tăng dần" trên Frontend. Frontend gửi GET request đến ProductController.getAllProducts() với query params: filter = "priceAsc", minPrice, maxPrice, categoryId.

Bước 2: ProductController parse query parameters. ProductController query Database để lấy tất cả sản phẩm với includes: LoaiSP, ThuongHieu, ChiTietHoaDons (cho BestSellerStrategy). Database trả về products array.

Bước 3: ProductController convert Sequelize models sang plain objects: products.map(p => p.toJSON()). ProductController gọi FilterContext.applyFilter(products, "priceAsc", {minPrice, maxPrice, categoryId}).

Bước 4: FilterContext gọi getStrategy("priceAsc"). FilterContext tra cứu trong strategies registry. FilterContext trả về PriceAscendingStrategy instance.

Bước 5: FilterContext gọi strategy.filter(products, queryParams). PriceAscendingStrategy clone products array. PriceAscendingStrategy gọi filterByPriceRange(products, minPrice, maxPrice). PriceAscendingStrategy gọi filterByCategory(products, categoryId).

Bước 6: PriceAscendingStrategy sort products theo Gia tăng dần. PriceAscendingStrategy trả về filtered và sorted products. FilterContext trả về kết quả cho ProductController.

Bước 7: ProductController áp dụng pagination: tính offset, lấy subset của products. ProductController format response với: products (paginated), pagination info, filter info. ProductController trả về JSON response cho Frontend.

Bước 8: Frontend nhận response. Frontend cập nhật state với products mới. Frontend re-render ProductList component. User thấy danh sách sản phẩm đã được sắp xếp theo giá tăng dần.

## 6.4. Activity Diagram

Activity Diagram mô tả luồng công việc (workflow) của một quy trình nghiệp vụ, bao gồm các activities, decisions và parallel flows.

### 6.4.1. Activity Diagram - Quy trình đặt hàng

**Swimlanes**: Customer, System, VNPay, Database.

**Luồng hoạt động**:

Start: Customer bắt đầu quy trình đặt hàng.

Activity (Customer): Duyệt sản phẩm và thêm vào giỏ hàng.

Activity (Customer): Vào trang giỏ hàng, xem lại sản phẩm.

Decision: Có muốn đặt hàng không? Nếu No: End. Nếu Yes: tiếp tục.

Activity (Customer): Nhấn "Đặt hàng", chuyển đến trang Checkout.

Activity (Customer): Chọn hoặc nhập địa chỉ giao hàng.

Decision: Có mã voucher không? Nếu Yes: Activity (Customer) nhập mã voucher, Activity (System) kiểm tra voucher hợp lệ. Decision: Voucher hợp lệ? Nếu No: hiển thị lỗi, quay lại nhập voucher. Nếu Yes: áp dụng voucher. Nếu No voucher: bỏ qua.

Activity (System): Tính giá đơn hàng sử dụng Decorator Pattern (Giá gốc + VAT - Voucher + Phí ship).

Activity (System): Hiển thị breakdown giá cho Customer.

Activity (Customer): Xác nhận thông tin và nhấn "Thanh toán".

Activity (System): Tạo bản ghi đơn hàng trong Database với trạng thái "Chờ xử lý".

Activity (Database): Lưu HoaDon, ChiTietHoaDon, DiaChiGiaoHang.

Activity (System): Tạo URL thanh toán VNPay.

Activity (System): Chuyển hướng Customer đến VNPay.

Activity (VNPay): Hiển thị trang thanh toán.

Activity (Customer): Chọn phương thức thanh toán và thực hiện thanh toán.

Activity (VNPay): Xử lý giao dịch.

Decision (VNPay): Thanh toán thành công? Nếu No: Activity (VNPay) chuyển hướng về với kết quả thất bại, Activity (System) hiển thị thông báo lỗi, Activity (Customer) có thể thử lại hoặc End. Nếu Yes: tiếp tục.

Activity (VNPay): Chuyển hướng về với kết quả thành công.

Activity (System): Xác thực chữ ký từ VNPay.

Activity (System): Cập nhật trạng thái thanh toán trong Database.

Activity (System): Trừ tồn kho cho các sản phẩm.

Activity (Database): Cập nhật SoLuongTonKho.

Activity (System): Xóa giỏ hàng.

Activity (System): Gửi email xác nhận đơn hàng.

Activity (System): Hiển thị trang xác nhận thành công với thông tin đơn hàng.

End: Quy trình đặt hàng hoàn tất.

**Parallel Activities**: Trong một số trường hợp, có thể có parallel flows như: gửi email xác nhận và cập nhật tồn kho có thể thực hiện song song.

## 6.5. Component Diagram

Component Diagram mô tả cấu trúc vật lý của hệ thống, bao gồm các components và dependencies giữa chúng.

### 6.5.1. Frontend Components

**Presentation Layer**: React Application chứa: Pages Components (HomePage, ProductListPage, ProductDetailPage, CartPage, CheckoutPage, OrderHistoryPage, AdminDashboard). Reusable Components (Header, Footer, ProductCard, Button, Input, Modal). Layout Components (UserLayout, AdminLayout).

**State Management**: Context API (AuthContext, CartContext).

**Services Layer**: API Services (authService, productService, cartService, orderService, paymentService). HTTP Client (Axios instance với interceptors).

**Dependencies**: React Application depends on API Services. API Services depends on Backend API.

### 6.5.2. Backend Components

**API Layer**: Express Server chứa: Routes (auth.routes, product.routes, cart.routes, order.routes, admin.routes). Middlewares (auth.middleware, error.middleware, upload.middleware, rateLimit.middleware).

**Business Logic Layer**: Controllers (AuthController, ProductController, CartController, OrderController, AdminController). Services (OrderService, PaymentService, GHNService, AddressService, EmailService). Design Patterns (Decorators: OrderPriceCalculator, VATDecorator, VoucherDecorator, ShippingDecorator. Strategies: ProductFilterStrategy, NewestStrategy, PriceAscendingStrategy, BestSellerStrategy, FilterContext. Singletons: DBConnection, Logger, ConfigService).

**Data Access Layer**: Models (TaiKhoan, KhachHang, SanPham, HoaDon, Voucher, và 16 models khác). Sequelize ORM. Database Connection Pool.

**Dependencies**: Routes depend on Controllers. Controllers depend on Services. Services depend on Models. Models depend on Sequelize ORM. Sequelize depends on Database.

### 6.5.3. External Components

**VNPay Payment Gateway**: Interface: REST API. Used by: PaymentService. Functions: Tạo URL thanh toán, Xử lý callback, Xử lý IPN.

**GHN Shipping Service**: Interface: REST API. Used by: GHNService. Functions: Tạo đơn vận chuyển, Lấy trạng thái vận chuyển, Tính phí ship.

**Email Service**: Interface: SMTP. Used by: EmailService. Functions: Gửi email xác nhận đơn hàng, Gửi email reset password.

### 6.5.4. Database Component

**SQL Server Database**: Contains: 21 tables (TaiKhoan, KhachHang, SanPham, HoaDon, và các bảng khác). Stored Procedures (nếu có). Views (nếu có). Indexes và Constraints.

**Dependencies**: Backend Models depend on Database. Database is accessed through Sequelize ORM.

### 6.5.5. Deployment Components

**Frontend Deployment**: Static Files (HTML, CSS, JavaScript bundles). Hosted on: Web Server (Nginx hoặc Apache) hoặc CDN.

**Backend Deployment**: Node.js Application. Hosted on: Application Server (PM2 process manager). Load Balancer (nếu có nhiều instances).

**Database Deployment**: SQL Server Instance. Backup Service. Monitoring Tools.

**Infrastructure**: Cloud Platform (AWS, Azure, hoặc on-premise). Container (Docker - nếu sử dụng). Orchestration (Kubernetes - nếu sử dụng).

### 6.5.6. Component Interfaces

**Frontend ↔ Backend**: Protocol: HTTP/HTTPS. Format: JSON. Authentication: JWT in Authorization header.

**Backend ↔ Database**: Protocol: TCP/IP. Driver: Sequelize with mssql driver. Connection Pool: Managed by Sequelize.

**Backend ↔ VNPay**: Protocol: HTTPS. Format: URL-encoded parameters. Security: HMAC SHA512 signature.

**Backend ↔ GHN**: Protocol: HTTPS. Format: JSON. Authentication: API Token in header.

## 6.6. Tổng kết về UML Diagrams

Các biểu đồ UML đã trình bày cung cấp cái nhìn toàn diện về hệ thống ToyStore từ nhiều góc độ khác nhau. Use Case Diagram cho thấy các chức năng mà hệ thống cung cấp và ai có thể sử dụng chúng. Class Diagram mô tả cấu trúc tĩnh của hệ thống với các classes, attributes, methods và relationships. Sequence Diagrams minh họa chi tiết cách các objects tương tác với nhau theo thời gian để thực hiện các use cases quan trọng. Activity Diagram trình bày luồng công việc của quy trình đặt hàng với các decisions và parallel activities. Component Diagram cho thấy cấu trúc vật lý của hệ thống và dependencies giữa các components.

Việc sử dụng UML giúp team phát triển có cùng một hiểu biết về hệ thống, tạo điều kiện cho việc giao tiếp hiệu quả giữa các thành viên. UML cũng là công cụ hữu ích cho việc tài liệu hóa hệ thống, giúp các developer mới dễ dàng hiểu và tham gia vào dự án. Trong quá trình phát triển, các biểu đồ UML có thể được cập nhật để phản ánh các thay đổi trong thiết kế, đảm bảo tài liệu luôn đồng bộ với code thực tế.


# PHẦN 7: ĐÁNH GIÁ VÀ KẾT LUẬN

## 7.1. Đánh giá quá trình phân tích và thiết kế

Sau khi hoàn thành quá trình phân tích và thiết kế hệ thống ToyStore, cần có một đánh giá tổng thể để nhận diện những điểm mạnh, điểm cần cải thiện, và rút ra bài học kinh nghiệm cho các dự án tương lai.

### 7.1.1. Điểm mạnh

**Yêu cầu được phân tích kỹ lưỡng và đầy đủ**

Quá trình thu thập và phân tích yêu cầu được thực hiện một cách có hệ thống thông qua nhiều phương pháp: phỏng vấn, khảo sát, nghiên cứu thị trường. Yêu cầu được phân loại rõ ràng thành ba nhóm: chức năng, phi chức năng và nghiệp vụ. Mỗi yêu cầu được mô tả chi tiết với mã định danh riêng, giúp dễ dàng theo dõi và quản lý. Việc xác định rõ ràng phi yêu cầu (non-requirements) giúp tập trung nguồn lực vào các tính năng cốt lõi, tránh scope creep.

**Kiến trúc ba tầng phù hợp và hiệu quả**

Lựa chọn kiến trúc ba tầng đã chứng minh là quyết định đúng đắn cho dự án quy mô vừa như ToyStore. Sự tách biệt rõ ràng giữa presentation, business logic và data tiers giúp code dễ bảo trì và mở rộng. Mỗi tầng có thể được phát triển, kiểm thử và triển khai độc lập, tạo điều kiện thuận lợi cho team work. Khả năng scale từng tầng riêng biệt đảm bảo hệ thống có thể đáp ứng khi lượng người dùng tăng cao.

**Áp dụng Design Patterns hiệu quả**

Việc áp dụng ba Design Patterns (Decorator, Strategy, Singleton) không chỉ cải thiện chất lượng code mà còn giải quyết các vấn đề thiết kế một cách elegant. Decorator Pattern cho việc tính giá đơn hàng giúp code linh hoạt và dễ mở rộng, tuân thủ Open/Closed Principle. Strategy Pattern cho việc lọc sản phẩm loại bỏ if-else hell, làm code sạch và dễ bảo trì. Singleton Pattern cho các utility classes đảm bảo tính nhất quán và tiết kiệm tài nguyên. Các patterns này không chỉ là lý thuyết mà được triển khai thực tế và mang lại lợi ích cụ thể.

**Database được thiết kế và chuẩn hóa tốt**

Database schema được thiết kế cẩn thận với 21 bảng, phản ánh đầy đủ các entities và relationships trong domain. Việc chuẩn hóa đến 3NF giúp giảm dư thừa dữ liệu và đảm bảo tính toàn vẹn. Các quan hệ giữa các bảng được định nghĩa rõ ràng với foreign keys và constraints phù hợp. Indexing được áp dụng có chọn lọc để tối ưu hiệu suất truy vấn mà không gây overhead không cần thiết.

**API RESTful chuẩn và nhất quán**

Thiết kế API tuân thủ các nguyên tắc RESTful, sử dụng HTTP methods đúng ngữ nghĩa, URL rõ ràng và có cấu trúc. Response format nhất quán giúp frontend dễ dàng xử lý. Authentication và authorization được triển khai bảo mật với JWT và RBAC. API documentation đầy đủ giúp các developer khác dễ dàng tích hợp.

**Quy trình phát triển Agile/Scrum phù hợp**

Lựa chọn mô hình Agile/Scrum đã giúp dự án linh hoạt thích ứng với thay đổi. Phát triển theo Sprint cho phép deliver value sớm và thu thập phản hồi liên tục. Daily Standup giúp team đồng bộ và phát hiện vấn đề sớm. Sprint Retrospective tạo cơ hội cải thiện quy trình làm việc liên tục.

### 7.1.2. Điểm cần cải thiện

**Thiếu caching layer**

Hệ thống hiện tại chưa triển khai caching, mọi request đều query trực tiếp vào database. Điều này có thể gây bottleneck khi lượng traffic tăng cao. Nên cân nhắc thêm Redis hoặc Memcached để cache các dữ liệu thường xuyên truy cập như danh sách sản phẩm, thông tin user session. Caching sẽ giảm tải cho database và cải thiện đáng kể response time.

**Chưa có unit tests đầy đủ**

Mặc dù hệ thống đã được kiểm thử thủ công kỹ lưỡng, nhưng thiếu unit tests tự động là một điểm yếu. Unit tests giúp phát hiện lỗi sớm, tạo confidence khi refactor code, và đóng vai trò như documentation sống. Nên đầu tư thời gian viết tests cho các modules quan trọng như services, decorators, strategies, với mục tiêu coverage tối thiểu bảy mươi phần trăm.

**Thiếu API documentation tự động**

Hiện tại API documentation được viết thủ công trong README, dễ bị outdated khi code thay đổi. Nên tích hợp Swagger hoặc OpenAPI để tự động generate API documentation từ code. Điều này đảm bảo documentation luôn đồng bộ với implementation và cung cấp interface để test API trực tiếp.

**Monitoring và logging chưa toàn diện**

Hệ thống có Logger Singleton nhưng chưa tích hợp với công cụ monitoring chuyên nghiệp. Nên cân nhắc sử dụng các công cụ như ELK Stack (Elasticsearch, Logstash, Kibana) để tập trung và phân tích logs. Application Performance Monitoring (APM) tools như New Relic hoặc Datadog sẽ giúp theo dõi hiệu suất và phát hiện vấn đề proactive.

**Chưa có disaster recovery plan**

Mặc dù có database backup tự động, nhưng chưa có kế hoạch chi tiết cho disaster recovery. Nên document rõ quy trình khôi phục hệ thống khi có sự cố nghiêm trọng, bao gồm: backup strategy, recovery time objective (RTO), recovery point objective (RPO), và các bước cụ thể để restore.

**Performance optimization chưa được ưu tiên**

Một số queries có thể được tối ưu hơn, ví dụ sử dụng eager loading thay vì N+1 queries. Image optimization chưa được thực hiện đầy đủ, có thể sử dụng CDN và image compression. Frontend bundle size có thể được giảm thông qua code splitting và lazy loading tốt hơn.

## 7.2. Bài học kinh nghiệm

Qua quá trình phân tích, thiết kế và triển khai hệ thống ToyStore, nhóm phát triển đã rút ra nhiều bài học quý giá.

### 7.2.1. Tầm quan trọng của phân tích yêu cầu kỹ lưỡng

Thời gian đầu tư vào phân tích yêu cầu là thời gian tiết kiệm được trong giai đoạn triển khai. Việc hiểu rõ yêu cầu từ đầu giúp tránh được nhiều thay đổi tốn kém sau này. Tuy nhiên, cũng cần cân bằng giữa phân tích chi tiết và bắt đầu coding, tránh analysis paralysis. Agile cho phép refine requirements liên tục, không cần phải perfect ngay từ đầu.

### 7.2.2. Design Patterns không phải silver bullet

Design Patterns là công cụ mạnh mẽ nhưng không nên lạm dụng. Chỉ áp dụng pattern khi nó thực sự giải quyết vấn đề cụ thể, không áp dụng vì muốn "show off" kiến thức. Trong ToyStore, ba patterns được chọn vì chúng giải quyết các vấn đề thực tế: tính giá phức tạp, nhiều cách sắp xếp, quản lý tài nguyên. Việc hiểu rõ vấn đề trước khi chọn pattern là quan trọng hơn việc biết nhiều patterns.

### 7.2.3. Tài liệu hóa code là đầu tư, không phải chi phí**

Ban đầu, viết documentation có vẻ tốn thời gian và làm chậm progress. Nhưng khi dự án phát triển, documentation trở thành tài sản vô giá. Nó giúp onboarding developer mới nhanh chóng, giảm dependency vào một vài người hiểu hệ thống. Documentation tốt nhất là code tự giải thích (self-documenting code) với tên biến, hàm rõ ràng, kết hợp với comments cho các phần phức tạp và README cho tổng quan.

### 7.2.4. Communication là chìa khóa trong team work

Trong nhóm nhỏ ba người, communication tốt là yếu tố quyết định thành công. Daily Standup không chỉ là báo cáo tiến độ mà là cơ hội để sync hiểu biết, phát hiện conflicts sớm, và hỗ trợ lẫn nhau. Sử dụng các công cụ collaboration như Git, Slack, Trello giúp team làm việc hiệu quả hơn. Code review không chỉ để catch bugs mà còn để share knowledge và maintain code quality.

### 7.2.5. Balance giữa perfection và pragmatism

Trong môi trường thực tế, không thể đạt được perfection. Cần biết khi nào nên refactor và khi nào nên accept technical debt tạm thời để meet deadline. Trong ToyStore, Sprint 4 được dành riêng cho refactoring và áp dụng Design Patterns, sau khi các tính năng cốt lõi đã hoạt động. Điều này cho phép deliver value sớm trong khi vẫn cải thiện chất lượng code sau.

### 7.2.6. Testing sớm, testing thường xuyên

Một trong những regret là không viết tests từ đầu. Viết tests sau khi code đã hoàn thành khó hơn nhiều và dễ bị bỏ qua. Trong dự án tiếp theo, nên áp dụng Test-Driven Development (TDD) hoặc ít nhất là viết tests ngay sau khi implement feature. Automated tests không chỉ catch bugs mà còn tạo confidence khi refactor và deploy.

## 7.3. Hướng phát triển tương lai

Hệ thống ToyStore hiện tại đã đáp ứng tốt các yêu cầu cơ bản của một nền tảng thương mại điện tử. Tuy nhiên, vẫn có nhiều hướng phát triển để cải thiện và mở rộng hệ thống.

### 7.3.1. Chuyển sang Microservices Architecture

Khi hệ thống phát triển lớn hơn với nhiều tính năng phức tạp, có thể cân nhắc chuyển từ monolithic backend sang microservices. Các services có thể bao gồm: User Service, Product Service, Order Service, Payment Service, Notification Service. Mỗi service có database riêng, scale độc lập, và communicate qua message queue hoặc API gateway. Tuy nhiên, microservices cũng mang lại complexity, chỉ nên chuyển khi thực sự cần thiết.

### 7.3.2. Triển khai Real-time features với WebSocket

Thêm các tính năng real-time để cải thiện user experience: real-time notifications khi đơn hàng thay đổi trạng thái, live chat support với customer service, real-time inventory updates khi sản phẩm sắp hết hàng. Sử dụng Socket.io hoặc WebSocket API để implement bidirectional communication giữa client và server.

### 7.3.3. Hệ thống đề xuất sản phẩm thông minh

Áp dụng Machine Learning để xây dựng recommendation system: collaborative filtering dựa trên lịch sử mua hàng của users tương tự, content-based filtering dựa trên đặc điểm sản phẩm, hybrid approach kết hợp cả hai. Recommendation system giúp tăng conversion rate và average order value. Có thể bắt đầu với các thuật toán đơn giản và cải thiện dần khi có đủ dữ liệu.

### 7.3.4. Phát triển Mobile Application

Xây dựng mobile app native cho iOS và Android, hoặc sử dụng React Native để code một lần chạy trên cả hai platform. Mobile app cung cấp trải nghiệm tốt hơn web trên thiết bị di động với: push notifications, offline mode, camera integration (scan barcode), location services (tìm cửa hàng gần nhất). Có thể tái sử dụng toàn bộ backend API hiện tại.

### 7.3.5. Mở rộng hỗ trợ đa ngôn ngữ

Thêm hỗ trợ tiếng Anh và các ngôn ngữ khác để mở rộng thị trường. Sử dụng i18n framework như react-i18next cho frontend và i18n cho backend. Cần translate không chỉ UI text mà cả content như tên sản phẩm, mô tả. Có thể sử dụng dịch vụ translation API hoặc thuê translator chuyên nghiệp.

### 7.3.6. Chương trình khách hàng thân thiết

Triển khai loyalty program để giữ chân khách hàng: tích điểm khi mua hàng, đổi điểm lấy voucher hoặc quà tặng, membership tiers với benefits khác nhau (free shipping, early access to sales), referral program (giới thiệu bạn bè nhận thưởng). Cần thiết kế database schema mới cho points, transactions, rewards.

### 7.3.7. Advanced Analytics và Business Intelligence

Xây dựng dashboard phân tích chuyên sâu cho business decisions: customer segmentation (phân nhóm khách hàng theo hành vi), cohort analysis (phân tích retention theo cohort), funnel analysis (tìm điểm rơi trong conversion funnel), A/B testing framework (test các thay đổi UI/UX). Tích hợp với Google Analytics, Mixpanel hoặc xây dựng in-house analytics.

### 7.3.8. Tối ưu hóa SEO và Marketing

Cải thiện SEO để tăng organic traffic: server-side rendering (SSR) với Next.js thay vì client-side rendering, structured data markup (Schema.org), sitemap và robots.txt optimization, page speed optimization. Tích hợp với marketing tools: Google Ads, Facebook Pixel, email marketing platforms (Mailchimp, SendGrid).

## 7.4. Kết luận chung

Tiểu luận này đã trình bày một cách toàn diện quá trình phân tích và thiết kế hệ thống thương mại điện tử ToyStore, từ giai đoạn thu thập yêu cầu, lựa chọn mô hình phát triển, thiết kế kiến trúc, thiết kế chi tiết, đến việc áp dụng các Design Patterns và minh họa bằng UML diagrams.

**Về mặt phân tích yêu cầu**, hệ thống đã được phân tích kỹ lưỡng với ba nhóm yêu cầu chính: chức năng, phi chức năng và nghiệp vụ. Việc phân loại và ưu tiên hóa yêu cầu giúp đội ngũ phát triển tập trung vào các tính năng cốt lõi, đồng thời đảm bảo chất lượng phi chức năng như hiệu suất, bảo mật và khả năng sử dụng.

**Về mặt mô hình phát triển**, lựa chọn Agile/Scrum đã chứng minh là phù hợp với bản chất của dự án thương mại điện tử. Phát triển theo Sprint cho phép linh hoạt thích ứng với thay đổi, deliver value sớm và thu thập phản hồi liên tục. Quy trình Scrum với các ceremonies như Sprint Planning, Daily Standup, Sprint Review và Retrospective giúp team làm việc hiệu quả và cải thiện liên tục.

**Về mặt kiến trúc**, kiến trúc ba tầng được lựa chọn là quyết định cân bằng giữa đơn giản và linh hoạt. Sự tách biệt rõ ràng giữa presentation, business logic và data tiers mang lại nhiều lợi ích: dễ bảo trì, dễ mở rộng, bảo mật tốt và khả năng tái sử dụng API. Tích hợp với các dịch vụ bên ngoài như VNPay và GHN được thực hiện một cách chuyên nghiệp, đảm bảo tính ổn định và bảo mật.

**Về mặt thiết kế chi tiết**, database được thiết kế và chuẩn hóa tốt đến 3NF, đảm bảo tính toàn vẹn dữ liệu và giảm dư thừa. API được thiết kế theo chuẩn RESTful, nhất quán và dễ sử dụng. Giao diện người dùng tuân thủ các nguyên tắc UI/UX hiện đại, đảm bảo trải nghiệm tốt trên mọi thiết bị.

**Về mặt áp dụng Design Patterns**, đây là điểm nổi bật của dự án. Ba patterns (Decorator, Strategy, Singleton) không chỉ là lý thuyết mà được triển khai thực tế và giải quyết các vấn đề cụ thể. Decorator Pattern cho việc tính giá đơn hàng linh hoạt và có thể mở rộng. Strategy Pattern cho việc lọc sản phẩm loại bỏ if-else hell và dễ dàng thêm cách sắp xếp mới. Singleton Pattern cho các utility classes đảm bảo tính nhất quán và tiết kiệm tài nguyên. Việc áp dụng các patterns này không chỉ cải thiện chất lượng code mà còn thể hiện sự hiểu biết sâu sắc về software engineering principles.

**Về mặt tài liệu hóa**, các UML diagrams (Use Case, Class, Sequence, Activity, Component) cung cấp cái nhìn trực quan và toàn diện về hệ thống từ nhiều góc độ khác nhau. Chúng không chỉ là công cụ thiết kế mà còn là tài liệu quý giá cho việc bảo trì và phát triển tiếp theo.

**Ý nghĩa thực tiễn** của tiểu luận này không chỉ dừng lại ở việc hoàn thành một bài tập môn học. Nó thể hiện quá trình áp dụng kiến thức lý thuyết vào thực tế, từ các khái niệm về phân tích yêu cầu, mô hình phát triển, kiến trúc phần mềm, đến các Design Patterns cụ thể. Dự án ToyStore là một case study thực tế cho thấy cách thức xây dựng một hệ thống thương mại điện tử hoàn chỉnh với chất lượng code tốt và kiến trúc vững chắc.

**Đóng góp của tiểu luận** bao gồm: cung cấp một ví dụ cụ thể về cách áp dụng Design Patterns trong thực tế, không chỉ là lý thuyết suông; trình bày quy trình phát triển phần mềm hoàn chỉnh từ A đến Z; chia sẻ kinh nghiệm và bài học từ một dự án thực tế; cung cấp tài liệu tham khảo hữu ích cho các developer muốn xây dựng hệ thống tương tự.

**Tầm nhìn tương lai** của hệ thống ToyStore rất rộng mở. Với nền tảng vững chắc đã được xây dựng, hệ thống có thể dễ dàng mở rộng với các tính năng mới như recommendation system, mobile app, multi-language support, loyalty program. Kiến trúc hiện tại cho phép scale khi lượng người dùng tăng cao, và có thể chuyển sang microservices khi cần thiết.

Tóm lại, tiểu luận này đã hoàn thành mục tiêu đề ra: phân tích và thiết kế một hệ thống thương mại điện tử hoàn chỉnh, áp dụng các kiến thức về phân tích yêu cầu, mô hình phát triển, kiến trúc phần mềm và Design Patterns. Hệ thống ToyStore không chỉ là một sản phẩm phần mềm mà còn là minh chứng cho việc áp dụng các nguyên tắc software engineering một cách đúng đắn và hiệu quả. Hy vọng rằng những kinh nghiệm và bài học từ dự án này sẽ hữu ích cho các dự án phát triển phần mềm trong tương lai.

# TÀI LIỆU THAM KHẢO

## Sách và tài liệu học thuật

[1] E. Gamma, R. Helm, R. Johnson, and J. Vlissides, *Design Patterns: Elements of Reusable Object-Oriented Software*. Boston, MA: Addison-Wesley, 1994.

[2] M. Fowler, *Patterns of Enterprise Application Architecture*. Boston, MA: Addison-Wesley, 2002.

[3] R. C. Martin, *Clean Architecture: A Craftsman's Guide to Software Structure and Design*. Upper Saddle River, NJ: Prentice Hall, 2017.

[4] I. Sommerville, *Software Engineering*, 10th ed. Boston, MA: Pearson, 2015.

[5] R. S. Pressman and B. R. Maxim, *Software Engineering: A Practitioner's Approach*, 8th ed. New York, NY: McGraw-Hill Education, 2014.

[6] K. Schwaber and J. Sutherland, *The Scrum Guide: The Definitive Guide to Scrum: The Rules of the Game*. Scrum.org, 2020. [Online]. Available: https://scrumguides.org/

[7] M. Cohn, *User Stories Applied: For Agile Software Development*. Boston, MA: Addison-Wesley, 2004.

[8] S. McConnell, *Code Complete: A Practical Handbook of Software Construction*, 2nd ed. Redmond, WA: Microsoft Press, 2004.

## Tài liệu kỹ thuật và documentation

[9] "React Documentation," React, 2024. [Online]. Available: https://react.dev/

[10] "Node.js Documentation," Node.js Foundation, 2024. [Online]. Available: https://nodejs.org/docs/

[11] "Express.js Documentation," Express, 2024. [Online]. Available: https://expressjs.com/

[12] "Sequelize Documentation," Sequelize, 2024. [Online]. Available: https://sequelize.org/docs/

[13] "SQL Server Documentation," Microsoft, 2024. [Online]. Available: https://docs.microsoft.com/sql/

[14] "Tailwind CSS Documentation," Tailwind Labs, 2024. [Online]. Available: https://tailwindcss.com/docs

## Bài viết và nghiên cứu trực tuyến

[15] M. Fowler, "Microservices," martinfowler.com, Mar. 2014. [Online]. Available: https://martinfowler.com/articles/microservices.html

[16] M. Fowler, "Patterns of Enterprise Application Architecture," martinfowler.com, 2002. [Online]. Available: https://martinfowler.com/eaaCatalog/

[17] "RESTful API Design: Best Practices," REST API Tutorial, 2024. [Online]. Available: https://restfulapi.net/

[18] "SOLID Principles," DigitalOcean Community, 2024. [Online]. Available: https://www.digitalocean.com/community/conceptual_articles/s-o-l-i-d-the-first-five-principles-of-object-oriented-design

[19] "Database Normalization," GeeksforGeeks, 2024. [Online]. Available: https://www.geeksforgeeks.org/database-normalization-normal-forms/

## API Documentation và Integration Guides

[20] "VNPay Payment Gateway Documentation," VNPay, 2024. [Online]. Available: https://sandbox.vnpayment.vn/apis/

[21] "Giao Hàng Nhanh API Documentation," GHN, 2024. [Online]. Available: https://api.ghn.vn/home/docs/

[22] "JWT Introduction," JWT.io, 2024. [Online]. Available: https://jwt.io/introduction

[23] "OAuth 2.0," OAuth, 2024. [Online]. Available: https://oauth.net/2/

## UML và Software Modeling

[24] "UML Diagrams," Unified Modeling Language, 2024. [Online]. Available: https://www.uml-diagrams.org/

[25] G. Booch, J. Rumbaugh, and I. Jacobson, *The Unified Modeling Language User Guide*, 2nd ed. Boston, MA: Addison-Wesley, 2005.

[26] M. Fowler, *UML Distilled: A Brief Guide to the Standard Object Modeling Language*, 3rd ed. Boston, MA: Addison-Wesley, 2003.

## Agile và Scrum Resources

[27] K. Beck et al., "Manifesto for Agile Software Development," Agile Alliance, 2001. [Online]. Available: https://agilemanifesto.org/

[28] "Scrum Framework," Scrum.org, 2024. [Online]. Available: https://www.scrum.org/resources/what-is-scrum

[29] M. Cohn, "Agile Estimating and Planning," Mountain Goat Software, 2024. [Online]. Available: https://www.mountaingoatsoftware.com/

## Security Best Practices

[30] "OWASP Top Ten," OWASP Foundation, 2024. [Online]. Available: https://owasp.org/www-project-top-ten/

[31] "Web Security," MDN Web Docs, 2024. [Online]. Available: https://developer.mozilla.org/en-US/docs/Web/Security

[32] "Node.js Security Best Practices," Node.js, 2024. [Online]. Available: https://nodejs.org/en/docs/guides/security/

## Performance và Optimization

[33] "Web Performance," Google Developers, 2024. [Online]. Available: https://developers.google.com/web/fundamentals/performance

[34] "Database Performance Tuning," Microsoft SQL Server, 2024. [Online]. Available: https://docs.microsoft.com/sql/relational-databases/performance/

[35] "React Performance Optimization," React, 2024. [Online]. Available: https://react.dev/learn/render-and-commit

## Testing và Quality Assurance

[36] K. Beck, *Test Driven Development: By Example*. Boston, MA: Addison-Wesley, 2002.

[37] "Jest Documentation," Jest, 2024. [Online]. Available: https://jestjs.io/docs/

[38] "Mocha Documentation," Mocha, 2024. [Online]. Available: https://mochajs.org/

## E-commerce Best Practices

[39] "E-commerce UX Best Practices," Nielsen Norman Group, 2024. [Online]. Available: https://www.nngroup.com/topic/ecommerce/

[40] "Building Scalable E-commerce Systems," AWS, 2024. [Online]. Available: https://aws.amazon.com/solutions/case-studies/ecommerce/

---

**Ghi chú:** Tất cả các tài liệu tham khảo trực tuyến đã được truy cập và xác minh vào tháng 12 năm 2025. Các URL có thể thay đổi theo thời gian.
