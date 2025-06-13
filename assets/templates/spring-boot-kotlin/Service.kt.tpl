// templates/spring-boot-kotlin/Service.kt.tpl

package {{packageName}}.service

import {{packageName}}.dto.Create{{resourceName}}Request
import {{packageName}}.dto.Update{{resourceName}}Request
import {{packageName}}.dto.{{resourceName}}Response
import {{packageName}}.entity.{{resourceName}}
import {{packageName}}.repository.{{resourceName}}Repository
import jakarta.persistence.EntityNotFoundException
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class {{resourceName}}Service(
    private val {{resourceNameLower}}Repository: {{resourceName}}Repository
) {

    @Transactional
    fun create(request: Create{{resourceName}}Request): {{resourceName}}Response {
        val {{resourceNameLower}} = {{resourceName}}(
            // TODO: Map properties from request to entity
        )
        val saved{{resourceName}} = {{resourceNameLower}}Repository.save({{resourceNameLower}})
        return saved{{resourceName}}.toResponse()
    }

    @Transactional(readOnly = true)
    fun findById(id: {{idType}}): {{resourceName}}Response {
        val {{resourceNameLower}} = {{resourceNameLower}}Repository.findById(id)
            .orElseThrow { EntityNotFoundException("{{resourceName}} not found with id: $id") }
        return {{resourceNameLower}}.toResponse()
    }

    @Transactional(readOnly = true)
    fun findAll(): List<{{resourceName}}Response> {
        return {{resourceNameLower}}Repository.findAll().map { it.toResponse() }
    }

    @Transactional
    fun update(id: {{idType}}, request: Update{{resourceName}}Request): {{resourceName}}Response {
        val existing{{resourceName}} = {{resourceNameLower}}Repository.findById(id)
            .orElseThrow { EntityNotFoundException("{{resourceName}} not found with id: $id") }
        
        // TODO: Update properties of existing{{resourceName}} from request
        
        val updated{{resourceName}} = {{resourceNameLower}}Repository.save(existing{{resourceName}})
        return updated{{resourceName}}.toResponse()
    }

    @Transactional
    fun delete(id: {{idType}}) {
        if (!{{resourceNameLower}}Repository.existsById(id)) {
            throw EntityNotFoundException("{{resourceName}} not found with id: $id")
        }
        {{resourceNameLower}}Repository.deleteById(id)
    }

    // Helper function to convert Entity to Response DTO
    private fun {{resourceName}}.toResponse(): {{resourceName}}Response {
        return {{resourceName}}Response(
            id = this.id,
            // TODO: Map other entity properties to response DTO
        )
    }
}