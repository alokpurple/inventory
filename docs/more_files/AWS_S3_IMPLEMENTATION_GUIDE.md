# AWS S3 Implementation Guide - Complete Setup

This guide provides **step-by-step instructions** to implement AWS S3 file storage for your Inventory Management System deployed on Railway.

## Table of Contents

1. [AWS Account Setup](#1-aws-account-setup)
2. [Create S3 Bucket](#2-create-s3-bucket)
3. [Configure IAM User & Permissions](#3-configure-iam-user--permissions)
4. [Backend Code Implementation](#4-backend-code-implementation)
5. [Frontend Code Implementation](#5-frontend-code-implementation)
6. [Railway Configuration](#6-railway-configuration)
7. [Testing](#7-testing)
8. [Best Practices & Security](#8-best-practices--security)
9. [Troubleshooting](#9-troubleshooting)

---

## 1. AWS Account Setup

### Step 1.1: Create AWS Account

1. Go to [aws.amazon.com](https://aws.amazon.com)
2. Click **"Create an AWS Account"**
3. Fill in:
   - Email address
   - Password
   - AWS account name
4. Choose **Personal** account type
5. Enter payment information (credit/debit card required)
   - **Note:** Free tier available, won't be charged unless you exceed limits
6. Verify phone number
7. Choose **Basic Support - Free** plan

### Step 1.2: Sign in to AWS Console

1. Go to [console.aws.amazon.com](https://console.aws.amazon.com)
2. Sign in with your email and password
3. Select your region (top-right corner)
   - Recommended: **US East (N. Virginia)** `us-east-1` (cheapest)
   - Or choose nearest to your users

---

## 2. Create S3 Bucket

### Step 2.1: Navigate to S3

1. In AWS Console, search for **"S3"** in the top search bar
2. Click **"S3"** service

### Step 2.2: Create Bucket

1. Click **"Create bucket"** button
2. Fill in the following:

**General Configuration:**
- **Bucket name**: `inventory-system-files` (must be globally unique)
  - If taken, try: `inventory-system-files-yourname` or `inventory-system-files-12345`
- **AWS Region**: `us-east-1` (or your chosen region)

**Object Ownership:**
- Select: **ACLs disabled (recommended)**

**Block Public Access settings:**
- **Uncheck** "Block all public access"
- Check the acknowledgment: "I acknowledge that the current settings might result in this bucket and the objects within becoming public"
  - **Note:** We'll configure specific public access later

**Bucket Versioning:**
- Select: **Disable** (unless you need version history)

**Tags (Optional):**
- Key: `Project`, Value: `InventorySystem`

**Default encryption:**
- Select: **Server-side encryption with Amazon S3 managed keys (SSE-S3)**
- Enable: **Bucket Key**

3. Click **"Create bucket"**

### Step 2.3: Configure CORS

1. Click on your newly created bucket name
2. Go to **"Permissions"** tab
3. Scroll down to **"Cross-origin resource sharing (CORS)"**
4. Click **"Edit"**
5. Paste the following CORS configuration:

```json
[
    {
        "AllowedHeaders": [
            "*"
        ],
        "AllowedMethods": [
            "GET",
            "PUT",
            "POST",
            "DELETE",
            "HEAD"
        ],
        "AllowedOrigins": [
            "http://localhost:4200",
            "https://your-frontend-domain.up.railway.app"
        ],
        "ExposeHeaders": [
            "ETag"
        ],
        "MaxAgeSeconds": 3000
    }
]
```

6. Replace `https://your-frontend-domain.up.railway.app` with your actual Railway frontend URL
7. Click **"Save changes"**

### Step 2.4: Configure Bucket Policy (Public Read Access)

1. Still in **"Permissions"** tab
2. Scroll to **"Bucket policy"**
3. Click **"Edit"**
4. Paste the following policy:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::inventory-system-files/*"
        }
    ]
}
```

5. **Important:** Replace `inventory-system-files` with your actual bucket name
6. Click **"Save changes"**

**What this does:** Allows anyone to **read/download** files from your bucket, but only authenticated users (your app) can upload.

---

## 3. Configure IAM User & Permissions

### Step 3.1: Create IAM User

1. In AWS Console, search for **"IAM"**
2. Click **"IAM"** service
3. In left sidebar, click **"Users"**
4. Click **"Create user"** button
5. Fill in:
   - **User name**: `inventory-app-s3-user`
6. Click **"Next"**

### Step 3.2: Set Permissions

1. Select: **Attach policies directly**
2. In the search box, type: `AmazonS3FullAccess`
3. **Check** the box next to `AmazonS3FullAccess`
   - **Note:** For production, you should create a custom policy with minimal permissions (see [Best Practices](#8-best-practices--security))
4. Click **"Next"**
5. Review and click **"Create user"**

### Step 3.3: Create Access Keys

1. Click on the newly created user: `inventory-app-s3-user`
2. Go to **"Security credentials"** tab
3. Scroll down to **"Access keys"**
4. Click **"Create access key"**
5. Select use case: **Application running outside AWS**
6. Check the confirmation box
7. Click **"Next"**
8. Description tag (optional): `Railway Inventory App`
9. Click **"Create access key"**

### Step 3.4: Save Credentials

**⚠️ CRITICAL:** This is the **only time** you can view the secret access key!

1. Copy and save securely:
   - **Access key ID**: `AKIAXXXXXXXXXXXXXXXX`
   - **Secret access key**: `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

2. **Recommended:** Download the `.csv` file
3. Click **"Done"**

**Security Note:** Never commit these keys to Git. Store them in Railway environment variables.

---

## 4. Backend Code Implementation

### Step 4.1: Add Maven Dependencies

Edit `backend/pom.xml` and add the following dependency inside `<dependencies>`:

```xml
<!-- AWS S3 SDK -->
<dependency>
    <groupId>com.amazonaws</groupId>
    <artifactId>aws-java-sdk-s3</artifactId>
    <version>1.12.529</version>
</dependency>
```

**Full example:**
```xml
<dependencies>
    <!-- Existing dependencies -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>

    <!-- Add this AWS S3 dependency -->
    <dependency>
        <groupId>com.amazonaws</groupId>
        <artifactId>aws-java-sdk-s3</artifactId>
        <version>1.12.529</version>
    </dependency>

    <!-- Other dependencies... -->
</dependencies>
```

### Step 4.2: Update Configuration Files

**For Local Development:**

Edit `backend/src/main/resources/application-dev.properties`:

```properties
# Existing properties...
server.port=8080
spring.datasource.url=jdbc:postgresql://localhost:5432/finaldb
spring.datasource.username=postgres
spring.datasource.password=123456
cors.allowed.origins=http://localhost:4200

# Add AWS S3 Configuration
aws.access.key.id=YOUR_ACCESS_KEY_ID
aws.secret.access.key=YOUR_SECRET_ACCESS_KEY
aws.s3.bucket.name=inventory-system-files
aws.region=us-east-1

# File Upload Settings
spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=10MB
```

**For Production (Railway):**

Edit `backend/src/main/resources/application.properties`:

```properties
# Existing properties...
server.port=${PORT:8080}
spring.datasource.url=${SPRING_DATASOURCE_URL}
spring.datasource.username=${SPRING_DATASOURCE_USERNAME}
spring.datasource.password=${SPRING_DATASOURCE_PASSWORD}
cors.allowed.origins=${CORS_ALLOWED_ORIGINS:http://localhost:4200}

# Add AWS S3 Configuration (using environment variables)
aws.access.key.id=${AWS_ACCESS_KEY_ID}
aws.secret.access.key=${AWS_SECRET_ACCESS_KEY}
aws.s3.bucket.name=${S3_BUCKET_NAME}
aws.region=${AWS_REGION:us-east-1}

# File Upload Settings
spring.servlet.multipart.max-file-size=${MAX_FILE_SIZE:10MB}
spring.servlet.multipart.max-request-size=${MAX_REQUEST_SIZE:10MB}
```

### Step 4.3: Create S3 Configuration Class

Create file: `backend/src/main/java/com/telusko/SecurityEx/config/S3Config.java`

```java
package com.telusko.SecurityEx.config;

import com.amazonaws.auth.AWSCredentials;
import com.amazonaws.auth.AWSStaticCredentialsProvider;
import com.amazonaws.auth.BasicAWSCredentials;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.AmazonS3ClientBuilder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

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

### Step 4.4: Create File Storage Service

Create file: `backend/src/main/java/com/telusko/SecurityEx/service/FileStorageService.java`

```java
package com.telusko.SecurityEx.service;

import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.model.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.UUID;

@Service
public class FileStorageService {

    @Autowired
    private AmazonS3 s3Client;

    @Value("${aws.s3.bucket.name}")
    private String bucketName;

    /**
     * Upload file to S3 and return the file URL
     */
    public String uploadFile(MultipartFile file) throws IOException {
        // Generate unique file name
        String fileName = generateFileName(file);

        // Set file metadata
        ObjectMetadata metadata = new ObjectMetadata();
        metadata.setContentType(file.getContentType());
        metadata.setContentLength(file.getSize());

        // Upload file to S3
        s3Client.putObject(
            new PutObjectRequest(bucketName, fileName, file.getInputStream(), metadata)
                .withCannedAcl(CannedAccessControlList.PublicRead) // Make file publicly readable
        );

        // Return the file URL
        return s3Client.getUrl(bucketName, fileName).toString();
    }

    /**
     * Delete file from S3
     */
    public void deleteFile(String fileUrl) {
        try {
            // Extract file name from URL
            String fileName = extractFileNameFromUrl(fileUrl);
            s3Client.deleteObject(bucketName, fileName);
        } catch (Exception e) {
            throw new RuntimeException("Failed to delete file: " + e.getMessage());
        }
    }

    /**
     * Check if file exists in S3
     */
    public boolean fileExists(String fileUrl) {
        try {
            String fileName = extractFileNameFromUrl(fileUrl);
            return s3Client.doesObjectExist(bucketName, fileName);
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Generate unique file name with UUID prefix
     */
    private String generateFileName(MultipartFile file) {
        String originalFileName = file.getOriginalFilename();
        String extension = "";

        if (originalFileName != null && originalFileName.contains(".")) {
            extension = originalFileName.substring(originalFileName.lastIndexOf("."));
        }

        return UUID.randomUUID().toString() + extension;
    }

    /**
     * Extract file name from S3 URL
     */
    private String extractFileNameFromUrl(String fileUrl) {
        return fileUrl.substring(fileUrl.lastIndexOf("/") + 1);
    }
}
```

### Step 4.5: Create File Upload Controller

Create file: `backend/src/main/java/com/telusko/SecurityEx/controller/FileUploadController.java`

```java
package com.telusko.SecurityEx.controller;

import com.telusko.SecurityEx.service.FileStorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/files")
public class FileUploadController {

    @Autowired
    private FileStorageService fileStorageService;

    /**
     * Upload single file
     */
    @PostMapping("/upload")
    public ResponseEntity<Map<String, String>> uploadFile(
            @RequestParam("file") MultipartFile file) {

        Map<String, String> response = new HashMap<>();

        try {
            // Validate file
            if (file.isEmpty()) {
                response.put("error", "File is empty");
                return ResponseEntity.badRequest().body(response);
            }

            // Validate file type (images and PDFs only)
            String contentType = file.getContentType();
            if (!isValidFileType(contentType)) {
                response.put("error", "Invalid file type. Only images and PDFs are allowed.");
                return ResponseEntity.badRequest().body(response);
            }

            // Validate file size (10MB max)
            if (file.getSize() > 10 * 1024 * 1024) {
                response.put("error", "File size exceeds 10MB limit");
                return ResponseEntity.badRequest().body(response);
            }

            // Upload to S3
            String fileUrl = fileStorageService.uploadFile(file);

            response.put("message", "File uploaded successfully");
            response.put("url", fileUrl);
            response.put("fileName", file.getOriginalFilename());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("error", "File upload failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Delete file
     */
    @DeleteMapping("/delete")
    public ResponseEntity<Map<String, String>> deleteFile(
            @RequestParam("url") String fileUrl) {

        Map<String, String> response = new HashMap<>();

        try {
            fileStorageService.deleteFile(fileUrl);
            response.put("message", "File deleted successfully");
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("error", "File deletion failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Validate file type
     */
    private boolean isValidFileType(String contentType) {
        return contentType != null && (
            contentType.startsWith("image/") ||
            contentType.equals("application/pdf")
        );
    }
}
```

### Step 4.6: Update SecurityConfig (Allow File Upload Endpoint)

Edit `backend/src/main/java/com/telusko/SecurityEx/config/SecurityConfig.java`

Find the `securityFilterChain` method and update the `authorizeHttpRequests` section:

```java
@Bean
public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception{
    return http
            .csrf(csrf->csrf.disable())
            .cors(Customizer.withDefaults())
            .authorizeHttpRequests(request->request
                    .requestMatchers("/register","/login").permitAll()
                    .requestMatchers("/api/files/**").authenticated()  // Add this line
                    .anyRequest().authenticated())
            .httpBasic(Customizer.withDefaults())
            .sessionManagement(session->
                    session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)
            .build();
}
```

### Step 4.7: Example - Add Profile Picture to Employee

**Option 1: Store URL directly**

Edit `backend/src/main/java/com/telusko/SecurityEx/model/Employee.java`:

```java
@Entity
public class Employee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    private String name;
    private String email;
    private String department;

    // Add this field to store S3 URL
    private String profilePictureUrl;

    // Getters and setters
    public String getProfilePictureUrl() {
        return profilePictureUrl;
    }

    public void setProfilePictureUrl(String profilePictureUrl) {
        this.profilePictureUrl = profilePictureUrl;
    }
}
```

**Option 2: Create dedicated File entity**

Create `backend/src/main/java/com/telusko/SecurityEx/model/FileMetadata.java`:

```java
package com.telusko.SecurityEx.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "file_metadata")
public class FileMetadata {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String fileName;
    private String fileType;
    private String fileUrl;
    private Long fileSize;
    private String uploadedBy; // user email
    private LocalDateTime uploadedAt;

    // Constructors, getters, setters

    public FileMetadata() {
        this.uploadedAt = LocalDateTime.now();
    }

    // Getters and setters...
}
```

---

## 5. Frontend Code Implementation

### Step 5.1: Create File Upload Service

Create file: `frontend/src/app/services/file-upload.service.ts`

```typescript
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FileUploadService {

  private apiUrl = environment.apiUrl + '/api/files';

  constructor(private http: HttpClient) { }

  /**
   * Upload file to S3 via backend
   */
  uploadFile(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);

    // Get JWT token from localStorage
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.post(`${this.apiUrl}/upload`, formData, { headers });
  }

  /**
   * Delete file from S3
   */
  deleteFile(fileUrl: string): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.delete(`${this.apiUrl}/delete?url=${encodeURIComponent(fileUrl)}`, { headers });
  }
}
```

### Step 5.2: Create File Upload Component

Create file: `frontend/src/app/components/file-upload/file-upload.component.ts`

```typescript
import { Component } from '@angular/core';
import { FileUploadService } from '../../services/file-upload.service';

@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.css']
})
export class FileUploadComponent {

  selectedFile: File | null = null;
  uploadedFileUrl: string | null = null;
  isUploading: boolean = false;
  uploadProgress: number = 0;
  errorMessage: string | null = null;

  constructor(private fileUploadService: FileUploadService) { }

  /**
   * Handle file selection
   */
  onFileSelected(event: any) {
    const file: File = event.target.files[0];

    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        this.errorMessage = 'Invalid file type. Only images and PDFs are allowed.';
        return;
      }

      // Validate file size (10MB)
      if (file.size > 10 * 1024 * 1024) {
        this.errorMessage = 'File size exceeds 10MB limit.';
        return;
      }

      this.selectedFile = file;
      this.errorMessage = null;
    }
  }

  /**
   * Upload file
   */
  uploadFile() {
    if (!this.selectedFile) {
      this.errorMessage = 'Please select a file first.';
      return;
    }

    this.isUploading = true;
    this.errorMessage = null;

    this.fileUploadService.uploadFile(this.selectedFile).subscribe({
      next: (response) => {
        console.log('Upload successful:', response);
        this.uploadedFileUrl = response.url;
        this.isUploading = false;
        this.selectedFile = null;
      },
      error: (error) => {
        console.error('Upload failed:', error);
        this.errorMessage = error.error?.error || 'File upload failed';
        this.isUploading = false;
      }
    });
  }

  /**
   * Delete uploaded file
   */
  deleteFile() {
    if (!this.uploadedFileUrl) return;

    this.fileUploadService.deleteFile(this.uploadedFileUrl).subscribe({
      next: (response) => {
        console.log('Delete successful:', response);
        this.uploadedFileUrl = null;
      },
      error: (error) => {
        console.error('Delete failed:', error);
        this.errorMessage = error.error?.error || 'File deletion failed';
      }
    });
  }

  /**
   * Reset form
   */
  reset() {
    this.selectedFile = null;
    this.uploadedFileUrl = null;
    this.errorMessage = null;
  }
}
```

### Step 5.3: Create File Upload Template

Create file: `frontend/src/app/components/file-upload/file-upload.component.html`

```html
<div class="file-upload-container">
  <h2>File Upload</h2>

  <!-- Error Message -->
  <div *ngIf="errorMessage" class="alert alert-danger">
    {{ errorMessage }}
  </div>

  <!-- File Selection -->
  <div class="upload-section" *ngIf="!uploadedFileUrl">
    <input
      type="file"
      (change)="onFileSelected($event)"
      accept="image/*,.pdf"
      class="form-control"
      [disabled]="isUploading"
    />

    <div *ngIf="selectedFile" class="file-info">
      <p><strong>Selected:</strong> {{ selectedFile.name }}</p>
      <p><strong>Size:</strong> {{ (selectedFile.size / 1024 / 1024).toFixed(2) }} MB</p>
      <p><strong>Type:</strong> {{ selectedFile.type }}</p>
    </div>

    <button
      (click)="uploadFile()"
      [disabled]="!selectedFile || isUploading"
      class="btn btn-primary"
    >
      {{ isUploading ? 'Uploading...' : 'Upload File' }}
    </button>
  </div>

  <!-- Upload Progress -->
  <div *ngIf="isUploading" class="progress-section">
    <div class="spinner-border" role="status">
      <span class="sr-only">Uploading...</span>
    </div>
    <p>Uploading file, please wait...</p>
  </div>

  <!-- Uploaded File Preview -->
  <div *ngIf="uploadedFileUrl" class="preview-section">
    <h3>Uploaded File</h3>

    <!-- Image Preview -->
    <img
      *ngIf="uploadedFileUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i)"
      [src]="uploadedFileUrl"
      alt="Uploaded file"
      class="uploaded-image"
    />

    <!-- PDF Preview -->
    <div *ngIf="uploadedFileUrl.match(/\.pdf$/i)" class="pdf-preview">
      <p>📄 PDF File Uploaded</p>
      <a [href]="uploadedFileUrl" target="_blank" class="btn btn-secondary">
        View PDF
      </a>
    </div>

    <!-- File URL -->
    <div class="file-url">
      <strong>File URL:</strong>
      <input type="text" [value]="uploadedFileUrl" readonly class="form-control" />
      <button (click)="deleteFile()" class="btn btn-danger">Delete File</button>
      <button (click)="reset()" class="btn btn-secondary">Upload Another</button>
    </div>
  </div>
</div>
```

### Step 5.4: Add Styles

Create file: `frontend/src/app/components/file-upload/file-upload.component.css`

```css
.file-upload-container {
  max-width: 600px;
  margin: 20px auto;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: #f9f9f9;
}

.upload-section {
  margin-bottom: 20px;
}

.file-info {
  margin: 15px 0;
  padding: 10px;
  background-color: #e9ecef;
  border-radius: 4px;
}

.file-info p {
  margin: 5px 0;
}

.progress-section {
  text-align: center;
  padding: 20px;
}

.preview-section {
  margin-top: 20px;
}

.uploaded-image {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  margin: 10px 0;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.pdf-preview {
  padding: 20px;
  background-color: #e9ecef;
  border-radius: 4px;
  text-align: center;
  margin: 10px 0;
}

.file-url {
  margin-top: 15px;
}

.file-url input {
  margin: 10px 0;
}

.file-url button {
  margin: 5px;
}

.alert {
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 15px;
}

.alert-danger {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin: 5px;
}

.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-primary:hover {
  background-color: #0056b3;
}

.btn-primary:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}

.btn-danger {
  background-color: #dc3545;
  color: white;
}

.btn-danger:hover {
  background-color: #c82333;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background-color: #5a6268;
}

.form-control {
  width: 100%;
  padding: 8px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  margin: 10px 0;
}
```

### Step 5.5: Register Component in Module

Edit `frontend/src/app/app.module.ts`:

```typescript
import { FileUploadComponent } from './components/file-upload/file-upload.component';

@NgModule({
  declarations: [
    // ... existing components
    FileUploadComponent  // Add this
  ],
  // ... rest of module config
})
export class AppModule { }
```

---

## 6. Railway Configuration

### Step 6.1: Add Environment Variables to Railway

1. Go to [railway.app](https://railway.app) and open your project
2. Click on your **Backend service**
3. Go to **Variables** tab
4. Click **"New Variable"**
5. Add the following variables:

| Variable Name | Value |
|---------------|-------|
| `AWS_ACCESS_KEY_ID` | Your AWS access key (from Step 3.4) |
| `AWS_SECRET_ACCESS_KEY` | Your AWS secret key (from Step 3.4) |
| `S3_BUCKET_NAME` | `inventory-system-files` (your bucket name) |
| `AWS_REGION` | `us-east-1` (your AWS region) |
| `MAX_FILE_SIZE` | `10MB` (optional, default is 10MB) |
| `MAX_REQUEST_SIZE` | `10MB` (optional, default is 10MB) |

### Step 6.2: Verify Environment Variables

Your Railway backend service should now have these environment variables:

```
PORT=8080
SPRING_DATASOURCE_URL=jdbc:postgresql://...
SPRING_DATASOURCE_USERNAME=...
SPRING_DATASOURCE_PASSWORD=...
CORS_ALLOWED_ORIGINS=http://localhost:4200,https://...
AWS_ACCESS_KEY_ID=AKIAXXXXXXXXXXXXXXXX
AWS_SECRET_ACCESS_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
S3_BUCKET_NAME=inventory-system-files
AWS_REGION=us-east-1
MAX_FILE_SIZE=10MB
MAX_REQUEST_SIZE=10MB
```

### Step 6.3: Deploy to Railway

1. Commit your code changes:
```bash
git add .
git commit -m "Add AWS S3 file upload functionality"
git push origin main
```

2. Railway will automatically detect the push and start deployment
3. Monitor deployment in Railway dashboard
4. Check deploy logs for any errors

---

## 7. Testing

### Step 7.1: Test Locally

**Backend:**
```bash
cd backend
$env:SPRING_PROFILES_ACTIVE="dev"; mvn spring-boot:run
```

**Frontend:**
```bash
cd frontend
npm start
```

**Test file upload:**
1. Navigate to `http://localhost:4200`
2. Go to file upload component (add route if needed)
3. Select an image or PDF
4. Click "Upload File"
5. Verify file appears in S3 bucket
6. Check file URL is returned

### Step 7.2: Verify S3 Bucket

1. Go to AWS Console → S3
2. Click on your bucket: `inventory-system-files`
3. You should see uploaded files with UUID names
4. Click on a file → Click "Open" to verify it's accessible

### Step 7.3: Test on Railway Production

1. After deployment completes, visit your Railway frontend URL
2. Log in to your application
3. Test file upload functionality
4. Verify files are uploaded to S3
5. Verify file URLs work and images display

### Step 7.4: Test File Deletion

1. Upload a file
2. Click "Delete File" button
3. Verify file is removed from S3 bucket
4. Verify file URL no longer works

---

## 8. Best Practices & Security

### 8.1: Create Custom IAM Policy (Recommended for Production)

Instead of using `AmazonS3FullAccess`, create a custom policy with minimal permissions:

1. Go to IAM → Policies → Create Policy
2. Use JSON editor:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:PutObject",
                "s3:GetObject",
                "s3:DeleteObject",
                "s3:ListBucket"
            ],
            "Resource": [
                "arn:aws:s3:::inventory-system-files",
                "arn:aws:s3:::inventory-system-files/*"
            ]
        }
    ]
}
```

3. Name it: `InventoryAppS3Policy`
4. Attach this policy to your IAM user instead of `AmazonS3FullAccess`

### 8.2: File Validation Best Practices

**Backend validation:**
- ✅ Validate file type (whitelist allowed types)
- ✅ Validate file size (enforce max limit)
- ✅ Sanitize file names
- ✅ Scan for malware (use AWS Lambda + ClamAV for production)
- ✅ Authenticate all upload requests

**Frontend validation:**
- ✅ Validate before upload (save bandwidth)
- ✅ Show file preview
- ✅ Display upload progress
- ✅ Handle errors gracefully

### 8.3: Security Checklist

- [ ] Never commit AWS credentials to Git
- [ ] Use environment variables for all secrets
- [ ] Rotate AWS access keys periodically (every 90 days)
- [ ] Enable S3 bucket encryption
- [ ] Enable S3 versioning (optional, for file recovery)
- [ ] Set up CloudWatch alarms for unusual S3 activity
- [ ] Use HTTPS only (Railway provides this by default)
- [ ] Implement rate limiting on upload endpoint
- [ ] Add user authentication to upload endpoints

### 8.4: Cost Optimization

**Free Tier (first 12 months):**
- 5 GB storage
- 20,000 GET requests
- 2,000 PUT requests

**After free tier:**
- Storage: ~$0.023 per GB/month
- Requests: Very cheap (fractions of a cent)

**Tips to minimize costs:**
- ✅ Compress images before upload
- ✅ Delete unused files regularly
- ✅ Use lifecycle policies to archive old files
- ✅ Monitor usage in AWS Cost Explorer

### 8.5: Performance Optimization

**Enable CloudFront CDN:**
1. Go to AWS CloudFront
2. Create distribution
3. Origin: Your S3 bucket
4. This caches files closer to users (faster loading)

**Image optimization:**
- Use WebP format for better compression
- Generate thumbnails for large images
- Implement lazy loading on frontend

---

## 9. Troubleshooting

### Issue 1: "Access Denied" Error

**Symptoms:** 403 error when accessing file URL

**Solution:**
- Verify bucket policy allows public read access
- Check CORS configuration
- Ensure file was uploaded with `PublicRead` ACL

### Issue 2: "InvalidAccessKeyId" Error

**Symptoms:** Backend can't connect to S3

**Solution:**
- Verify `AWS_ACCESS_KEY_ID` is correct in Railway
- Check IAM user has correct permissions
- Ensure no extra spaces in environment variables

### Issue 3: "NoSuchBucket" Error

**Symptoms:** Bucket not found error

**Solution:**
- Verify bucket name is correct
- Check bucket is in the same region as configured
- Ensure bucket wasn't deleted

### Issue 4: File Upload Fails Silently

**Symptoms:** No error, but file doesn't appear in S3

**Solution:**
- Check backend logs for errors
- Verify `spring.servlet.multipart.max-file-size` setting
- Ensure IAM user has `PutObject` permission
- Check network connectivity from Railway to AWS

### Issue 5: CORS Error on Frontend

**Symptoms:** "CORS policy blocked" error in browser console

**Solution:**
- Add frontend URL to S3 CORS configuration
- Update both `http://localhost:4200` and Railway frontend URL
- Clear browser cache
- Verify CORS configuration is saved in S3

### Issue 6: Large Files Timeout

**Symptoms:** Upload fails for files >5MB

**Solution:**
- Increase timeout in Spring Boot:
```properties
spring.mvc.async.request-timeout=60000
```
- Implement chunked upload for very large files
- Consider direct browser-to-S3 upload (presigned URLs)

---

## Summary Checklist

### AWS Setup
- [ ] Created AWS account
- [ ] Created S3 bucket with unique name
- [ ] Configured CORS on S3 bucket
- [ ] Set bucket policy for public read access
- [ ] Created IAM user
- [ ] Generated access keys
- [ ] Saved access keys securely

### Backend Implementation
- [ ] Added AWS SDK dependency to `pom.xml`
- [ ] Updated `application-dev.properties` with AWS config
- [ ] Updated `application.properties` with environment variables
- [ ] Created `S3Config.java`
- [ ] Created `FileStorageService.java`
- [ ] Created `FileUploadController.java`
- [ ] Updated `SecurityConfig.java` to allow file endpoints
- [ ] (Optional) Updated entity models to store file URLs

### Frontend Implementation
- [ ] Created `file-upload.service.ts`
- [ ] Created `file-upload.component.ts`
- [ ] Created `file-upload.component.html`
- [ ] Created `file-upload.component.css`
- [ ] Registered component in `app.module.ts`
- [ ] Added routing (if needed)

### Railway Configuration
- [ ] Added `AWS_ACCESS_KEY_ID` environment variable
- [ ] Added `AWS_SECRET_ACCESS_KEY` environment variable
- [ ] Added `S3_BUCKET_NAME` environment variable
- [ ] Added `AWS_REGION` environment variable
- [ ] Committed and pushed code to GitHub
- [ ] Verified Railway deployment succeeded

### Testing
- [ ] Tested file upload locally
- [ ] Tested file deletion locally
- [ ] Verified files appear in S3 bucket
- [ ] Tested on Railway production
- [ ] Verified file URLs work
- [ ] Tested with different file types (images, PDFs)
- [ ] Tested file size limits

### Security
- [ ] AWS credentials not committed to Git
- [ ] Environment variables configured in Railway
- [ ] File type validation implemented
- [ ] File size validation implemented
- [ ] Authentication required for uploads
- [ ] CORS properly configured

---

## Next Steps

1. **Implement in your application:**
   - Add profile pictures to Employee entity
   - Add product images to Inventory items
   - Add invoice/receipt uploads

2. **Enhance functionality:**
   - Multiple file upload
   - Image cropping/resizing
   - File compression
   - Upload progress bar

3. **Production improvements:**
   - Enable CloudFront CDN
   - Implement image thumbnails
   - Add malware scanning
   - Set up S3 lifecycle policies

4. **Monitoring:**
   - Set up AWS CloudWatch alarms
   - Monitor S3 costs
   - Track upload/download metrics

---

## Resources

- [AWS S3 Documentation](https://docs.aws.amazon.com/s3/)
- [AWS SDK for Java Documentation](https://docs.aws.amazon.com/sdk-for-java/)
- [Spring Boot File Upload Guide](https://spring.io/guides/gs/uploading-files/)
- [AWS Free Tier Details](https://aws.amazon.com/free/)

---

**Congratulations!** You now have a complete AWS S3 file storage implementation for your Railway-deployed application! 🎉
