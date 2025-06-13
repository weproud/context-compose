// templates/spring-boot-kotlin/Dto.kt.tpl

package {{packageName}}.dto

import java.time.LocalDateTime

// API 응답에 사용될 데이터 클래스
data class {{resourceName}}Response(
    val id: {{idType}},
    // TODO: Add other properties for the response
    val createdAt: LocalDateTime,
    val updatedAt: LocalDateTime
)

// 리소스 생성을 위한 요청에 사용될 데이터 클래스
data class Create{{resourceName}}Request(
    // TODO: Add properties required for creation
    val name: String,
    val price: Double
)

// 리소스 수정을 위한 요청에 사용될 데이터 클래스
data class Update{{resourceName}}Request(
    // TODO: Add properties that can be updated
    val name: String?,
    val price: Double?
)