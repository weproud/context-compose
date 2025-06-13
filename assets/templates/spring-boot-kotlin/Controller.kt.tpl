// templates/spring-boot-kotlin/Controller.kt.tpl

package {{packageName}}.controller

import {{packageName}}.dto.Create{{resourceName}}Request
import {{packageName}}.dto.Update{{resourceName}}Request
import {{packageName}}.dto.{{resourceName}}Response
import {{packageName}}.service.{{resourceName}}Service
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/v1/{{resourceNamePlural}}")
class {{resourceName}}Controller(
    private val {{resourceNameLower}}Service: {{resourceName}}Service
) {

    @PostMapping
    fun create{{resourceName}}(@RequestBody request: Create{{resourceName}}Request): ResponseEntity<{{resourceName}}Response> {
        val created{{resourceName}} = {{resourceNameLower}}Service.create(request)
        return ResponseEntity.status(HttpStatus.CREATED).body(created{{resourceName}})
    }

    @GetMapping("/{id}")
    fun get{{resourceName}}ById(@PathVariable id: {{idType}}): ResponseEntity<{{resourceName}}Response> {
        val {{resourceNameLower}} = {{resourceNameLower}}Service.findById(id)
        return ResponseEntity.ok({{resourceNameLower}})
    }

    @GetMapping
    fun getAll{{resourceNamePlural}}(): ResponseEntity<List<{{resourceName}}Response>> {
        val {{resourceNamePlural}} = {{resourceNameLower}}Service.findAll()
        return ResponseEntity.ok({{resourceNamePlural}})
    }

    @PutMapping("/{id}")
    fun update{{resourceName}}(@PathVariable id: {{idType}}, @RequestBody request: Update{{resourceName}}Request): ResponseEntity<{{resourceName}}Response> {
        val updated{{resourceName}} = {{resourceNameLower}}Service.update(id, request)
        return ResponseEntity.ok(updated{{resourceName}})
    }

    @DeleteMapping("/{id}")
    fun delete{{resourceName}}(@PathVariable id: {{idType}}): ResponseEntity<Void> {
        {{resourceNameLower}}Service.delete(id)
        return ResponseEntity.noContent().build()
    }
}