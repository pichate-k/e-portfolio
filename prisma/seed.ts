import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding dual language database...");

  // 1. Admin Users
  const pkPasswordHash = await bcrypt.hash("password@pk", 10);
  await prisma.user.upsert({
    where: { email: "pichate_k@rmutt.ac.th" },
    update: { passwordHash: pkPasswordHash },
    create: {
      email: "pichate_k@rmutt.ac.th",
      name: "Dr. Pichate K.",
      passwordHash: pkPasswordHash,
      role: "ADMIN",
    },
  });

  const adminPasswordHash = await bcrypt.hash("admin123456", 10);
  await prisma.user.upsert({
    where: { email: "admin@pichatek.com" },
    update: {},
    create: {
      email: "admin@pichatek.com",
      name: "Dr. Pichate K.",
      passwordHash: adminPasswordHash,
      role: "ADMIN",
    },
  });

  // 2. Site Setting & CV Download Password
  const downloadPasswordHash = await bcrypt.hash("pichate2025", 10);
  const existingSetting = await prisma.siteSetting.findFirst();
  if (!existingSetting) {
    await prisma.siteSetting.create({
      data: {
        siteTitle: "Dr. Pichate K. | Academic & Professional Portfolio",
        bioTagline: "Assistant Professor, AI Researcher & Engineering Educator",
        downloadPasswordHash,
        requireCvPassword: true,
        themePreference: "system",
      },
    });
  }

  // 3. Profile Information (Dual Language TH-EN)
  const existingProfile = await prisma.profile.findFirst();
  const profileData = {
    fullName: "Dr. Pichate K.",
    fullNameTh: "ดร. พิเชษฐ์ เค.",
    currentPosition: "Assistant Professor & Lead AI Researcher",
    currentPositionTh: "ผู้ช่วยศาสตราจารย์ และหัวหน้าทีมนักวิจัย AI",
    workplace: "Faculty of Engineering, Rajamangala University of Technology Thanyaburi",
    workplaceTh: "คณะวิศวกรรมศาสตร์ มหาวิทยาลัยเทคโนโลยีราชมงคลธัญบุรี",
    address: "39 Moo 1, Klong 6, Khlong Luang, Pathum Thani 12110, Thailand",
    addressTh: "39 หมู่ 1 ต.คลองหก อ.คลองหลวง จ.ปทุมธานี 12110 ประเทศไทย",
    email: "pichate.k@rmutt.ac.th",
    phone: "+66 (0) 2-549-3400",
    websiteUrl: "https://pichatek.com",
    linkedinUrl: "https://linkedin.com/in/pichatek",
    githubUrl: "https://github.com/pichatek",
    avatarUrl: "",
    bio: "Academic researcher and engineering educator specializing in Machine Learning, Intelligent Systems, and IoT Automation. Dedicated to bridging cutting-edge scientific innovation with high-impact real-world engineering solutions.",
    bioTh: "นักวิจัยและอาจารย์ผู้เชี่ยวชาญด้านระบบการเรียนรู้ของเครื่อง (Machine Learning) ระบบอัจฉริยะ และระบบอัตโนมัติ IoT มุ่งเน้นการเชื่อมโยงนวัตกรรมทางวิทยาการคอมพิวเตอร์ชั้นนำเข้ากับงานวิศวกรรมที่สร้างผลกระทบเชิงบวกต่อสังคมและอุตสาหกรรมจริง",
  };

  if (existingProfile) {
    await prisma.profile.update({
      where: { id: existingProfile.id },
      data: profileData,
    });
  } else {
    await prisma.profile.create({ data: profileData });
  }

  // 4. Default Sections (Dual Language TH-EN)
  const defaultSections = [
    {
      slug: "education",
      title: "Educational Background",
      titleTh: "ประวัติการศึกษา",
      description: "Academic degrees, dissertations, and formal institutional qualifications.",
      descriptionTh: "คุณวุฒิทางการศึกษา ปริญญาบัตร และวิทยานิพนธ์ระดับบัณฑิตศึกษา",
      orderIndex: 1,
      isSystem: true,
      icon: "GraduationCap",
      items: [
        {
          title: "Ph.D. in Computer Engineering",
          titleTh: "วิศวกรรมศาสตรดุษฎีบัณฑิต (วิศวกรรมคอมพิวเตอร์)",
          subtitle: "Dissertation on Autonomous Embedded Edge Intelligence",
          subtitleTh: "วิทยานิพนธ์: สถาปัตยกรรมปัญญาประดิษฐ์ระดับขอบสำหรับระบบสมองกลฝังตัว",
          organization: "Chulalongkorn University",
          organizationTh: "จุฬาลงกรณ์มหาวิทยาลัย",
          location: "Bangkok, Thailand",
          locationTh: "กรุงเทพมหานคร",
          startDate: "2015",
          endDate: "2019",
          isCurrent: false,
          description: "Conducted advanced research in distributed real-time computing, deep neural network pruning for microcontrollers, and wireless sensor networks.",
          descriptionTh: "วิจัยขั้นสูงด้านการประมวลผลแบบกระจายศูนย์ การลดขนาดโมเดลโครงข่ายประสาทเทียมสำหรับไมโครคอนโทรลเลอร์ และเครือข่ายเซนเซอร์ไร้สาย",
          orderIndex: 1,
        },
        {
          title: "M.Eng. in Electrical & Information Engineering",
          titleTh: "วิศวกรรมศาสตรมหาบัณฑิต (วิศวกรรมไฟฟ้าและสารสนเทศ)",
          subtitle: "Graduated with High Honors",
          subtitleTh: "สำเร็จการศึกษาด้วยผลการเรียนดีเด่น",
          organization: "King Mongkut's Institute of Technology Ladkrabang",
          organizationTh: "สถาบันเทคโนโลยีพระจอมเกล้าเจ้าคุณทหารลาดกระบัง",
          location: "Bangkok, Thailand",
          locationTh: "กรุงเทพมหานคร",
          startDate: "2012",
          endDate: "2014",
          isCurrent: false,
          description: "Specialized in Signal Processing, Digital Systems, and Industrial Automation protocols.",
          descriptionTh: "ความเชี่ยวชาญเฉพาะทางด้านการประมวลผลสัญญาณ ระบบดิจิทัล และโพรโทคอลระบบควบคุมอัตโนมัติในงานอุตสาหกรรม",
          orderIndex: 2,
        },
        {
          title: "B.Eng. in Computer Engineering",
          titleTh: "วิศวกรรมศาสตรบัณฑิต (วิศวกรรมคอมพิวเตอร์)",
          subtitle: "First Class Honors",
          subtitleTh: "เกียรตินิยมอันดับ 1",
          organization: "Rajamangala University of Technology Thanyaburi",
          organizationTh: "มหาวิทยาลัยเทคโนโลยีราชมงคลธัญบุรี",
          location: "Pathum Thani, Thailand",
          locationTh: "ปทุมธานี",
          startDate: "2008",
          endDate: "2012",
          isCurrent: false,
          description: "Focused on Software Architecture, Embedded Systems, and Database Systems design.",
          descriptionTh: "เน้นการออกแบบสถาปัตยกรรมซอฟต์แวร์ ระบบสมองกลฝังตัว และระบบฐานข้อมูล",
          orderIndex: 3,
        },
      ],
    },
    {
      slug: "experience",
      title: "Work Experience",
      titleTh: "ประสบการณ์การทำงาน",
      description: "Chronological professional appointments, faculty roles, and research tenures.",
      descriptionTh: "ประวัติการทำงาน ตำแหน่งทางวิชาการ และงานวิจัยตามลำดับเวลา",
      orderIndex: 2,
      isSystem: true,
      icon: "Briefcase",
      items: [
        {
          title: "Assistant Professor",
          titleTh: "ผู้ช่วยศาสตราจารย์",
          subtitle: "Department of Computer Engineering",
          subtitleTh: "ภาควิชาวิศวกรรมคอมพิวเตอร์",
          organization: "Rajamangala University of Technology Thanyaburi",
          organizationTh: "มหาวิทยาลัยเทคโนโลยีราชมงคลธัญบุรี",
          location: "Pathum Thani, Thailand",
          locationTh: "ปทุมธานี",
          startDate: "2020",
          endDate: "Present",
          isCurrent: true,
          description: "Lead lecturer for Advanced Algorithms, Machine Learning Systems, and Cloud-Native Architectures. Supervising master's and doctoral research theses.",
          descriptionTh: "อาจารย์ผู้บรรยายรายวิชาอัลกอริทึมขั้นสูง ระบบการเรียนรู้ของเครื่อง และสถาปัตยกรรมคลาวด์ พร้อมทั้งอาจารย์ที่ปรึกษาวิทยานิพนธ์ระดับบัณฑิตศึกษา",
          orderIndex: 1,
        },
        {
          title: "Postdoctoral Research Fellow",
          titleTh: "นักวิจัยหลังปริญญาเอก (Postdoctoral Researcher)",
          subtitle: "Smart City & Intelligent Systems Laboratory",
          subtitleTh: "ห้องปฏิบัติการเมืองอัจฉริยะและระบบสารสนเทศขั้นสูง",
          organization: "National Science and Technology Development Agency (NSTDA)",
          organizationTh: "สำนักงานพัฒนาวิทยาศาสตร์และเทคโนโลยีแห่งชาติ (สวทช.)",
          location: "Pathum Thani, Thailand",
          locationTh: "ปทุมธานี",
          startDate: "2019",
          endDate: "2020",
          isCurrent: false,
          description: "Engineered deep learning models for urban sensory anomaly detection and environmental monitoring.",
          descriptionTh: "พัฒนาโมเดลการเรียนรู้เชิงลึกเพื่อตรวจจับความผิดปกติในระบบเซนเซอร์ตรวจวัดคุณภาพสิ่งแวดล้อมสำหรับเมืองอัจฉริยะ",
          orderIndex: 2,
        },
        {
          title: "Senior Embedded Software Engineer",
          titleTh: "วิศวกรซอฟต์แวร์สมองกลฝังตัวอาวุโส",
          subtitle: "R&D Division",
          subtitleTh: "ฝ่ายวิจัยและพัฒนาผลิตภัณฑ์",
          organization: "Precision Automation Technologies Ltd.",
          organizationTh: "บริษัท พรีซิชั่น ออโตเมชั่น เทคโนโลยี จำกัด",
          location: "Bangkok, Thailand",
          locationTh: "กรุงเทพมหานคร",
          startDate: "2014",
          endDate: "2015",
          isCurrent: false,
          description: "Architected firmware for high-throughput industrial telemetry controllers and CAN-bus sensor networks.",
          descriptionTh: "ออกแบบและพัฒนาเฟิร์มแวร์สำหรับอุปกรณ์ควบคุมโทรมาตรอุตสาหกรรมความเร็วสูงและเครือข่ายเซนเซอร์ CAN-bus",
          orderIndex: 3,
        },
      ],
    },
    {
      slug: "expertise",
      title: "Areas of Expertise",
      titleTh: "ความเชี่ยวชาญเฉพาะด้าน",
      description: "Core technical proficiencies, specialized domains, and toolchains.",
      descriptionTh: "ทักษะความเชี่ยวชาญทางเทคนิค สาขาวิจัยหลัก และเทคโนโลยีที่เชี่ยวชาญ",
      orderIndex: 3,
      isSystem: true,
      icon: "Cpu",
      items: [
        {
          title: "Artificial Intelligence & Machine Learning",
          titleTh: "ปัญญาประดิษฐ์และการเรียนรู้ของเครื่อง (AI / Machine Learning)",
          subtitle: "Deep Learning, Edge AI, Computer Vision, Model Optimization",
          subtitleTh: "การเรียนรู้เชิงลึก, Edge AI, คอมพิวเตอร์วิทัศน์, และการเพิ่มประสิทธิภาพโมเดล",
          tags: "PyTorch, TensorFlow, TensorRT, ONNX, OpenCV, Scikit-learn",
          description: "Expertise in training, compressing, and quantizing neural network models for real-time edge hardware.",
          descriptionTh: "เชี่ยวชาญในการฝึกฝน บีบอัด และ Quantization โครงข่ายประสาทเทียมเพื่อทำงานบนอุปกรณ์ Edge และเซิร์ฟเวอร์ความเร็วสูง",
          orderIndex: 1,
        },
        {
          title: "Distributed Systems & Cloud Computing",
          titleTh: "ระบบประมวลผลแบบกระจายศูนย์และคลาวด์คอมพิวติง",
          subtitle: "Microservices, Data Pipelines, Serverless & Containerization",
          subtitleTh: "ไมโครเซอร์วิส, ไปป์ไลน์ข้อมูลขนาดใหญ่, ระบบ Serverless และคอนเทนเนอร์",
          tags: "Docker, Kubernetes, PostgreSQL, Prisma, Redis, Next.js, Node.js",
          description: "Designing fault-tolerant backends, distributed message queues, and high-performance relational databases.",
          descriptionTh: "ออกแบบระบบแบ็กเอนด์ที่ทนต่อความขัดข้อง ระบบคิวส่งข้อความแบบกระจาย และระบบจัดการฐานข้อมูลสมรรถนะสูง",
          orderIndex: 2,
        },
        {
          title: "Embedded Systems & IoT",
          titleTh: "ระบบสมองกลฝังตัวและอินเทอร์เน็ตของสรรพสิ่ง (IoT)",
          subtitle: "Microcontroller Firmware, RTOS, Industrial Protocols",
          subtitleTh: "การเขียนเฟิร์มแวร์ไมโครคอนโทรลเลอร์, RTOS และโพรโทคอลอุตสาหกรรม",
          tags: "C/C++, FreeRTOS, ESP32, STM32, MQTT, Modbus, BLE",
          description: "Low-level driver implementation, power optimization, and multi-sensor telemetry integration.",
          descriptionTh: "พัฒนาไดรเวอร์ระดับล่าง การจัดการพลังงานขั้นสูง และการผสานรวมเครือข่ายโทรมาตรหลากเซนเซอร์",
          orderIndex: 3,
        },
      ],
    },
    {
      slug: "publications",
      title: "Academic Publications and Achievements",
      titleTh: "ผลงานทางวิชาการและรางวัลความสำเร็จ",
      description: "Peer-reviewed journal papers, conference proceedings, patents, and awards.",
      descriptionTh: "บทความวิจัยในวารสารวิชาการระดับนานาชาติ การประชุมวิชาการ สิทธิบัตร และรางวัลเชิดชูเกียรติ",
      orderIndex: 4,
      isSystem: true,
      icon: "BookOpen",
      items: [
        {
          title: "Lightweight Convolutional Architectures for Real-Time Edge Video Analytics",
          titleTh: "สถาปัตยกรรมโครงข่ายคอนโวลูชันแบบน้ำหนักเบาสำหรับการวิเคราะห์วิดีโอแบบเรียลไทม์บนอุปกรณ์ขอบ",
          subtitle: "IEEE Transactions on Industrial Informatics, Vol. 19, No. 4, pp. 4820-4831",
          subtitleTh: "วารสาร IEEE Transactions on Industrial Informatics (Q1, IF: 12.3)",
          organization: "IEEE",
          organizationTh: "สถาบันวิศวกรรมไฟฟ้าและอิเล็กทรอนิกส์นานาชาติ (IEEE)",
          startDate: "2023",
          url: "https://doi.org/10.1109/TII.2023.sample1",
          description: "Proposed a novel channel-pruning mechanism that achieves 4.2x speedup on ARM Cortex devices while preserving 97.8% classification accuracy.",
          descriptionTh: "นำเสนอกลไก Channel-Pruning แบบใหม่ที่ช่วยเพิ่มความเร็วในการประมวลผลขึ้น 4.2 เท่าบนอุปกรณ์ ARM Cortex โดยรักษาความแม่นยำได้สูงถึง 97.8%",
          tags: "Q1 Journal, Impact Factor: 12.3",
          orderIndex: 1,
        },
        {
          title: "Federated Learning Framework for Multi-Campus Environmental Sensor Networks",
          titleTh: "กรอบการทำงานการเรียนรู้แบบรวมศูนย์ (Federated Learning) สำหรับเครือข่ายเซนเซอร์ตรวจวัดสิ่งแวดล้อมข้ามวิทยาเขต",
          subtitle: "Proceedings of ACM International Conference on Intelligent Computing (ICIC 2022)",
          subtitleTh: "การประชุมวิชาการระดับนานาชาติ ACM ICIC 2022",
          organization: "ACM",
          organizationTh: "สมาคมเครื่องจักรกลคอมพิวเตอร์ (ACM)",
          startDate: "2022",
          url: "https://doi.org/10.1145/sample.2022",
          description: "Developed privacy-preserving federated aggregation algorithm for decentralized IoT sensor nodes with non-IID distributions.",
          descriptionTh: "พัฒนาอัลกอริทึมการประมวลผลรวมข้อมูลที่รักษาความเป็นส่วนตัวสำหรับโหนดเซนเซอร์ IoT กระจายศูนย์ที่มีการกระจายข้อมูลแบบ non-IID",
          tags: "Best Paper Award",
          orderIndex: 2,
        },
        {
          title: "National Outstanding Young Researcher in Computer Engineering",
          titleTh: "รางวัลนักวิจัยรุ่นใหม่ดีเด่นแห่งชาติ สาขาวิศวกรรมคอมพิวเตอร์",
          subtitle: "National Research Council of Thailand (NRCT)",
          subtitleTh: "สำนักงานการวิจัยแห่งชาติ (วช.)",
          organization: "Ministry of Higher Education, Science, Research and Innovation",
          organizationTh: "กระทรวงการอุดมศึกษา วิทยาศาสตร์ วิจัยและนวัตกรรม (อว.)",
          startDate: "2021",
          description: "Recognized for seminal contributions to edge computing applied to smart agriculture and environmental monitoring.",
          descriptionTh: "ได้รับรางวัลเชิดชูเกียรติผลงานวิจัยดีเด่นด้านการประยุกต์ใช้ Edge Computing เพื่อการเกษตรอัจฉริยะและการตรวจวัดสิ่งแวดล้อม",
          tags: "National Honor",
          orderIndex: 3,
        },
      ],
    },
    {
      slug: "other_experience",
      title: "Other Relevant Experience",
      titleTh: "ประสบการณ์อื่นๆ ที่เกี่ยวข้อง",
      description: "Consulting advisory, academic committees, journal reviews, and technical mentorship.",
      descriptionTh: "งานที่ปรึกษาภาคอุตสาหกรรม คณะกรรมการวิชาการ ผู้ทรงคุณวุฒิประเมินบทความวิจัย และการเป็นวิทยากร",
      orderIndex: 5,
      isSystem: true,
      icon: "Award",
      items: [
        {
          title: "Technical Advisory Consultant",
          titleTh: "ที่ปรึกษาด้านเทคนิคการเปลี่ยนผ่านสู่ดิจิทัลและ IoT อุตสาหกรรม",
          subtitle: "Industrial IoT Transformation",
          subtitleTh: "การประยุกต์ใช้ระบบอัตโนมัติและ IoT ในโรงงานอัจฉริยะ",
          organization: "Eastern Economic Corridor (EEC) Automation Alliance",
          organizationTh: "พันธมิตรระบบอัตโนมัติเขตพัฒนาพิเศษภาคตะวันออก (EEC)",
          startDate: "2021",
          endDate: "Present",
          isCurrent: true,
          description: "Advising manufacturing enterprises on digital transformation, automated data acquisition, and predictive maintenance.",
          descriptionTh: "ให้คำปรึกษาแก่ผู้ประกอบการอุตสาหกรรมการผลิตในการปรับเปลี่ยนสู่ระบบดิจิทัลและการบำรุงรักษาเชิงพยากรณ์ด้วยปัญญาประดิษฐ์",
          orderIndex: 1,
        },
        {
          title: "Associate Editor & Peer Reviewer",
          titleTh: "กองบรรณาธิการร่วมและผู้ทรงคุณวุฒิตรวจประเมินบทความวิจัย",
          subtitle: "IEEE Access & Elsevier Journal of Systems Architecture",
          subtitleTh: "วารสาร IEEE Access และ Elsevier Journal of Systems Architecture",
          organization: "IEEE & Elsevier",
          organizationTh: "สำนักพิมพ์วิชาการ IEEE และ Elsevier",
          startDate: "2019",
          endDate: "Present",
          isCurrent: true,
          description: "Reviewed over 60 peer-reviewed manuscripts in embedded AI, sensor networks, and edge computing.",
          descriptionTh: "ประเมินบทความวิจัยระดับนานาชาติกว่า 60 ฉบับในด้าน Embedded AI เครือข่ายเซนเซอร์ และ Edge Computing",
          orderIndex: 2,
        },
      ],
    },
    {
      slug: "training",
      title: "Training and Professional Development History",
      titleTh: "ประวัติการฝึกอบรมและการพัฒนาวิชาชีพ",
      description: "Specialized professional workshops, certified credentials, and executive courses.",
      descriptionTh: "การอบรมเชิงปฏิบัติการเฉพาะทาง ใบประกาศนียบัตรวิชาชีพ และหลักสูตรพัฒนาผู้นำ",
      orderIndex: 6,
      isSystem: true,
      icon: "CheckCircle",
      items: [
        {
          title: "NVIDIA Deep Learning Institute Certified Instructor",
          titleTh: "ผู้สอนที่ได้รับการรับรองจากสถาบันการเรียนรู้เชิงลึก NVIDIA (DLI Certified Instructor)",
          subtitle: "Fundamentals of Deep Learning for Computer Vision",
          subtitleTh: "หลักสูตรพื้นฐานการเรียนรู้เชิงลึกสำหรับคอมพิวเตอร์วิทัศน์",
          organization: "NVIDIA DLI",
          organizationTh: "NVIDIA Deep Learning Institute",
          startDate: "2022",
          description: "Certified to deliver official NVIDIA university courseware and hands-on laboratory workshops on GPU acceleration.",
          descriptionTh: "ได้รับการรับรองอย่างเป็นทางการในการสอนหลักสูตรมหาวิทยาลัยของ NVIDIA และการจัดเวิร์กช็อปภาคปฏิบัติด้าน GPU Acceleration",
          tags: "Certification",
          orderIndex: 1,
        },
        {
          title: "AWS Certified Solutions Architect – Associate",
          titleTh: "ใบรับรองสถาปัตยกรรมคลาวด์ AWS Certified Solutions Architect",
          subtitle: "Amazon Web Services",
          subtitleTh: "Amazon Web Services (AWS)",
          organization: "Amazon Web Services",
          organizationTh: "Amazon Web Services",
          startDate: "2021",
          description: "Validated architectural expertise in scalable high-availability cloud infrastructure and VPC networking.",
          descriptionTh: "รับรองความสามารถด้านการออกแบบสถาปัตยกรรมคลาวด์ที่มีความพร้อมใช้งานสูงและสามารถขยายตัวได้อย่างปลอดภัย",
          tags: "Certification",
          orderIndex: 2,
        },
      ],
    },
    {
      slug: "projects",
      title: "Project Management Experience",
      titleTh: "ประสบการณ์การบริหารจัดการโครงการวิจัยและวิศวกรรม",
      description: "Funded research grants, enterprise engineering projects, and leadership initiatives.",
      descriptionTh: "ทุนวิจัยที่ได้รับการสนับสนุน โครงการวิศวกรรมภาคอุตสาหกรรม และการนำทีมพัฒนาเทคโนโลยี",
      orderIndex: 7,
      isSystem: true,
      icon: "FolderKanban",
      items: [
        {
          title: "AI-Powered Microclimate Telemetry for Precision Agriculture",
          titleTh: "โครงการระบบโทรมาตรสภาพภูมิอากาศจุลภาคด้วยปัญญาประดิษฐ์เพื่อการเกษตรแม่นยำสูง",
          subtitle: "Principal Investigator (PI)",
          subtitleTh: "หัวหน้าโครงการวิจัยหลัก (Principal Investigator)",
          organization: "Agricultural Research Development Agency (ARDA) Grant",
          organizationTh: "สำนักงานพัฒนาการวิจัยการเกษตร (สวก.)",
          startDate: "2022",
          endDate: "2024",
          isCurrent: false,
          description: "Led a cross-disciplinary team of 14 researchers and software engineers. Designed an autonomous solar-powered LoRa mesh sensor network across 500 hectares, saving 28% water usage.",
          descriptionTh: "บริหารจัดการทีมนักวิจัยและวิศวกรซอฟต์แวร์ 14 ท่าน ออกแบบเครือข่าย LoRa mesh พลังงานแสงอาทิตย์ครอบคลุมพื้นที่ 500 เฮกตาร์ ช่วยลดการใช้น้ำได้ถึง 28%",
          tags: "Budget: 4.5M THB, 14 Members",
          url: "https://example.com/project-precision-ag",
          orderIndex: 1,
        },
        {
          title: "Smart Campus Autonomous Energy Management & Microgrid Optimization",
          titleTh: "โครงการระบบบริหารจัดการพลังงานอัจฉริยะและการเพิ่มประสิทธิภาพไมโครกริดในมหาวิทยาลัย",
          subtitle: "Project Co-Director",
          subtitleTh: "ผู้อำนวยการร่วมโครงการ",
          organization: "RMUTT Campus Sustainability Fund",
          organizationTh: "กองทุนเพื่อความยั่งยืน มทร.ธัญบุรี",
          startDate: "2021",
          endDate: "2023",
          isCurrent: false,
          description: "Directed the deployment of smart energy meters and automated cooling schedule algorithms across 8 academic buildings.",
          descriptionTh: "อำนวยการติดตั้งมิเตอร์พลังงานอัจฉริยะและอัลกอริทึมควบคุมระบบปรับอากาศอัตโนมัติในอาคารเรียน 8 หลัง",
          tags: "Budget: 2.8M THB, Energy Analytics",
          orderIndex: 2,
        },
      ],
    },
  ];

  for (const sectionData of defaultSections) {
    const { items, ...sectionMeta } = sectionData;
    const section = await prisma.cvSection.upsert({
      where: { slug: sectionMeta.slug },
      update: {
        title: sectionMeta.title,
        titleTh: sectionMeta.titleTh,
        description: sectionMeta.description,
        descriptionTh: sectionMeta.descriptionTh,
        orderIndex: sectionMeta.orderIndex,
        isSystem: true,
        icon: sectionMeta.icon,
      },
      create: {
        ...sectionMeta,
      },
    });

    // Update or insert items
    for (const item of items) {
      const existingItem = await prisma.cvItem.findFirst({
        where: {
          sectionId: section.id,
          title: item.title,
        },
      });

      if (existingItem) {
        await prisma.cvItem.update({
          where: { id: existingItem.id },
          data: item,
        });
      } else {
        await prisma.cvItem.create({
          data: {
            ...item,
            sectionId: section.id,
          },
        });
      }
    }
  }

  console.log("Dual language seed executed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
