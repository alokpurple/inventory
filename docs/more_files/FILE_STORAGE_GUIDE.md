# File Storage Guide for Railway Deployment

## The Problem: Ephemeral Storage on Railway

**Important:** Railway containers use **ephemeral (temporary) storage**, which means:

❌ Files uploaded to the container's file system are **lost** when:
- The application restarts
- A new deployment occurs
- Railway scales or moves your container

❌ **This is NOT suitable for:**
- User-uploaded images (profile pictures, product images)
- PDF documents (invoices, reports)
- Any persistent file storage needs

## Why Railway Uses Ephemeral Storage

Railway (like most cloud platforms - Heroku, Docker, Kubernetes) uses ephemeral storage because:

1. **Scalability**: Containers can be created/destroyed dynamically
2. **Statelessness**: Applications should be stateless for horizontal scaling
3. **Best Practices**: Separating compute (app) from storage (files/database)

## Solutions for Persistent File Storage

### Option 1: Cloud Storage Services (Recommended)

Use dedicated cloud storage services for persistent file storage.

#### A. AWS S3 (Most Popular)

**Pros:**
- Industry standard
- Reliable and scalable
- Free tier: 5GB storage, 20,000 GET requests, 2,000 PUT requests/month
- Direct browser uploads possible
- CDN integration (CloudFront)

**Pricing after free tier:**
- Storage: ~$0.023/GB per month
- Requests: Very cheap (fractions of a cent)

**Setup:**
1. Create AWS account
2. Create S3 bucket
3. Get Access Key ID and Secret Access Key
4. Add to Railway environment variables

**Spring Boot Dependencies:**
```xml
<!-- pom.xml -->
<dependency>
    <groupId>com.amazonaws</groupId>
    <artifactId>aws-java-sdk-s3</artifactId>
    <version>1.12.529</version>
</dependency>
```

**Configuration:**
```properties
# application.properties
aws.access.key.id=${AWS_ACCESS_KEY_ID}
aws.secret.access.key=${AWS_SECRET_ACCESS_KEY}
aws.s3.bucket.name=${S3_BUCKET_NAME}
aws.region=${AWS_REGION:us-east-1}
```

---

#### B. Cloudinary (Best for Images)

**Pros:**
- Specialized for images and videos
- Built-in image transformations (resize, crop, optimize)
- Automatic format conversion (WebP, AVIF)
- Free tier: 25GB storage, 25GB bandwidth/month
- Easy to use

**Pricing after free tier:**
- $89/month for more features

**Setup:**
1. Sign up at [cloudinary.com](https://cloudinary.com)
2. Get Cloud Name, API Key, API Secret
3. Add to Railway environment variables

**Spring Boot Dependencies:**
```xml
<!-- pom.xml -->
<dependency>
    <groupId>com.cloudinary</groupId>
    <artifactId>cloudinary-http44</artifactId>
    <version>1.36.0</version>
</dependency>
```

**Configuration:**
```properties
# application.properties
cloudinary.cloud.name=${CLOUDINARY_CLOUD_NAME}
cloudinary.api.key=${CLOUDINARY_API_KEY}
cloudinary.api.secret=${CLOUDINARY_API_SECRET}
```

---

#### C. Supabase Storage (Modern Alternative)

**Pros:**
- Open-source
- Free tier: 1GB storage, 2GB bandwidth/month
- Built-in authentication integration
- Image transformations
- PostgreSQL integration (you're already using PostgreSQL)

**Pricing:**
- Free tier generous for starting
- Pro: $25/month (100GB storage, 200GB bandwidth)

**Setup:**
1. Sign up at [supabase.com](https://supabase.com)
2. Create storage bucket
3. Get project URL and API key
4. Use REST API or Java SDK

---

#### D. Railway Volumes (Limited Use Case)

**Note:** Railway offers persistent volumes, but:

⚠️ **Limitations:**
- Volumes are tied to a specific Railway service instance
- If service moves to different region/server, volume doesn't follow
- Not suitable for multi-instance deployments
- Manual backup required
- **NOT recommended for production file storage**

**Only use for:**
- SQLite databases (if not using PostgreSQL)
- Cache files
- Temporary data that can be regenerated

---

### Option 2: Database Storage (For Small Files Only)

Store files as **BLOB (Binary Large Objects)** in PostgreSQL.

**Pros:**
- Simple setup (already have database)
- Transactional consistency with data
- Works for Railway deployment

**Cons:**
- ❌ Increases database size significantly
- ❌ Slower than file systems
- ❌ Not suitable for large files (>1MB)
- ❌ Expensive database storage
- ❌ Harder to serve files efficiently

**When to use:**
- Small files only (<100KB)
- Profile pictures (thumbnails)
- Icons, small PDFs

**PostgreSQL approach:**
```sql
-- Create table for file storage
CREATE TABLE files (
    id SERIAL PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    file_type VARCHAR(100),
    file_data BYTEA NOT NULL,  -- Binary data
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Spring Boot Entity:**
```java
@Entity
public class FileEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String filename;
    private String fileType;

    @Lob  // Large Object
    private byte[] fileData;

    private LocalDateTime uploadedAt;
}
```

---

## Recommended Approach for Your Inventory System

### Scenario 1: Images Only (Product/Employee Photos)

**Use: Cloudinary**

**Why:**
- Free tier is generous (25GB)
- Built-in image optimization
- Automatic responsive images
- Easy integration

**Implementation:**
1. Sign up for Cloudinary
2. Add credentials to Railway env vars
3. Create upload service in Spring Boot
4. Store Cloudinary URL in database (not the file itself)

---

### Scenario 2: Mixed Files (Images + PDFs + Documents)

**Use: AWS S3**

**Why:**
- Most flexible
- Industry standard
- Handles any file type
- Cheap and reliable

**Implementation:**
1. Create AWS account
2. Create S3 bucket
3. Add AWS credentials to Railway
4. Store S3 URLs in database

---

### Scenario 3: Budget-Conscious Startup

**Use: Supabase Storage**

**Why:**
- Free tier: 1GB storage
- Modern, developer-friendly
- Integrates well with PostgreSQL
- Can migrate to S3 later if needed

---

## Example Implementation: File Upload with S3

### Step 1: Add Dependencies

```xml
<!-- pom.xml -->
<dependency>
    <groupId>com.amazonaws</groupId>
    <artifactId>aws-java-sdk-s3</artifactId>
    <version>1.12.529</version>
</dependency>
```

### Step 2: Create S3 Configuration

```java
// config/S3Config.java
@Configuration
public class S3Config {

    @Value("${aws.access.key.id}")
    private String accessKeyId;

    @Value("${aws.secret.access.key}")
    private String secretAccessKey;

    @Value("${aws.region}")
    private String region;

    @Bean
    public AmazonS3 s3Client() {
        AWSCredentials credentials = new BasicAWSCredentials(accessKeyId, secretAccessKey);
        return AmazonS3ClientBuilder
                .standard()
                .withCredentials(new AWSStaticCredentialsProvider(credentials))
                .withRegion(region)
                .build();
    }
}
```

### Step 3: Create File Upload Service

```java
// service/FileStorageService.java
@Service
public class FileStorageService {

    @Autowired
    private AmazonS3 s3Client;

    @Value("${aws.s3.bucket.name}")
    private String bucketName;

    public String uploadFile(MultipartFile file) throws IOException {
        String fileName = generateFileName(file);

        ObjectMetadata metadata = new ObjectMetadata();
        metadata.setContentType(file.getContentType());
        metadata.setContentLength(file.getSize());

        s3Client.putObject(
            new PutObjectRequest(bucketName, fileName, file.getInputStream(), metadata)
                .withCannedAcl(CannedAccessControlList.PublicRead)
        );

        return s3Client.getUrl(bucketName, fileName).toString();
    }

    private String generateFileName(MultipartFile file) {
        return UUID.randomUUID().toString() + "-" + file.getOriginalFilename();
    }

    public void deleteFile(String fileUrl) {
        String fileName = fileUrl.substring(fileUrl.lastIndexOf("/") + 1);
        s3Client.deleteObject(bucketName, fileName);
    }
}
```

### Step 4: Create Upload Controller

```java
// controller/FileUploadController.java
@RestController
@RequestMapping("/api/files")
public class FileUploadController {

    @Autowired
    private FileStorageService fileStorageService;

    @PostMapping("/upload")
    public ResponseEntity<Map<String, String>> uploadFile(
            @RequestParam("file") MultipartFile file) {
        try {
            String fileUrl = fileStorageService.uploadFile(file);
            return ResponseEntity.ok(Map.of("url", fileUrl));
        } catch (IOException e) {
            return ResponseEntity.status(500)
                .body(Map.of("error", "File upload failed"));
        }
    }
}
```

### Step 5: Store URL in Database

```java
// Example: Employee with profile picture
@Entity
public class Employee {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String email;

    // Store the S3 URL, not the file itself
    private String profilePictureUrl;

    // ... other fields
}
```

### Step 6: Configure Railway Environment Variables

Add to Railway backend service:

| Variable | Value |
|----------|-------|
| `AWS_ACCESS_KEY_ID` | Your AWS access key |
| `AWS_SECRET_ACCESS_KEY` | Your AWS secret key |
| `S3_BUCKET_NAME` | Your S3 bucket name |
| `AWS_REGION` | `us-east-1` (or your region) |

---

## Cost Comparison

### For 10GB storage, 50GB bandwidth/month:

| Service | Monthly Cost | Free Tier |
|---------|--------------|-----------|
| **AWS S3** | ~$1.50 | 5GB storage, 1 year |
| **Cloudinary** | Free (if under 25GB) | 25GB storage, 25GB bandwidth |
| **Supabase** | Free (if under 1GB) or $25/month | 1GB storage, 2GB bandwidth |
| **Railway Volumes** | Included in Railway | Ephemeral risk |
| **Database (PostgreSQL)** | ~$5-10 extra | Not recommended |

**Cheapest option for starting:** Cloudinary (free tier is generous)

---

## Implementation Checklist

When adding file upload to your app:

### Backend Setup
- [ ] Choose storage provider (Cloudinary/S3/Supabase)
- [ ] Add dependencies to `pom.xml`
- [ ] Create configuration class
- [ ] Create file storage service
- [ ] Create upload controller endpoint
- [ ] Update entity models to store file URLs
- [ ] Add environment variables to Railway

### Frontend Setup
- [ ] Create file upload component
- [ ] Add file input and preview
- [ ] Handle file selection
- [ ] Send file to backend API
- [ ] Display uploaded file URL/preview
- [ ] Handle errors

### Security Considerations
- [ ] Validate file types (images, PDFs only)
- [ ] Limit file size (e.g., max 5MB)
- [ ] Sanitize file names
- [ ] Add authentication to upload endpoints
- [ ] Use signed URLs for private files
- [ ] Scan for malware (if handling user uploads)

---

## Quick Recommendation

**For your Inventory Management System, I recommend:**

### Start with: **Cloudinary** (Free Tier)

**Reasons:**
1. ✅ Free tier is generous (25GB storage, 25GB bandwidth)
2. ✅ Perfect for product images and employee photos
3. ✅ Built-in image optimization (faster loading)
4. ✅ Very easy to integrate
5. ✅ Can handle PDFs too (though optimized for images)
6. ✅ Automatic backups and CDN

**When to migrate to S3:**
- You exceed Cloudinary's free tier
- You need more control over file storage
- You're storing many non-image files (PDFs, documents)

---

## Summary

**The Key Points:**

1. ❌ Railway's file system is **ephemeral** - files are lost on redeployment
2. ✅ Use **cloud storage** for persistent files (images, PDFs, documents)
3. ✅ **Recommended:** Start with Cloudinary (free, easy, optimized for images)
4. ✅ Store file **URLs** in your PostgreSQL database, not the files themselves
5. ❌ **Never** rely on Railway's local file system for user uploads

**Next Steps:**

If you want to add file upload functionality:
1. Choose a storage provider (I recommend Cloudinary)
2. Sign up and get API credentials
3. Add credentials to Railway environment variables
4. Implement upload service in Spring Boot
5. Create upload UI in Angular

Would you like me to help you implement file upload with Cloudinary or S3?
