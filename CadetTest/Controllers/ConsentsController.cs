using CadetTest.Entities;
using CadetTest.Models;
using CadetTest.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CadetTest.Controllers
{
    [AllowAnonymous]
    [Route("api/[controller]")]
    [ApiController]
    public class ConsentsController : ControllerBase
    {
        private ILogger<ConsentsController> _logger;
        private AppSettings _appSettings;
        private IDataService _dataService;
        private readonly JsonSerializerSettings _jsonSettings;

        public ConsentsController(ILogger<ConsentsController> logger, IOptions<AppSettings> appSettings, IDataService dataService)
        {
            _logger = logger;
            _appSettings = appSettings.Value;
            _dataService = dataService;
            _jsonSettings = new JsonSerializerSettings { ContractResolver = new CamelCasePropertyNamesContractResolver() };
        }

        [HttpGet]
        public IActionResult GetAllConsents()
        {
            try
            {
                var consents = _dataService.GetAllConsents(); // IDataService'deki metodu kullanarak tüm consentsleri al

                if (consents == null || consents.Count == 0)
                {
                    return NoContent();
                }

                return Ok(consents);
            }
            catch (System.Exception ex)
            {
                _logger.LogError($"Consents alınırken bir hata oluştu: {ex.Message}");
                return StatusCode(500, "Bir hata oluştu, lütfen daha sonra tekrar deneyin.");
            }
        }

        [HttpPost]
        public IActionResult Post(ConsentRequest request)
        {
            var cevap = _dataService.GetRangeById(request.StartId, request.Count);
            return Ok(cevap);
        }

        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            var consent = _dataService.GetById(id);

            if (consent == null)
            {
                return NotFound();
            }

            _dataService.Delete(consent); // Assuming Delete method in IDataService

            return NoContent(); // 204 No Content response
        }

        [HttpPost("add")]
        public IActionResult AddConsent(Consent request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                // Yeni consent oluşturma
                var newConsent = new Consent
                {
                    Type = request.Type,
                    Recipient = request.Recipient,
                    Status = request.Status,
                    RecipientType = request.RecipientType,
                    CreatedAt = DateTime.UtcNow // veya gerektiğinde farklı bir zaman
                };

                // Veritabanına ekleme işlemi
                _dataService.Add(newConsent);

                // Başarılı yanıt döndürme
                return Ok(newConsent);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Consent eklenirken bir hata oluştu: {ex.Message}");
                return StatusCode(StatusCodes.Status500InternalServerError, "Bir hata oluştu, lütfen daha sonra tekrar deneyin.");
            }
        }

        [HttpPut("{id}")]
        public IActionResult UpdateConsent(int id, Consent request)
        {
            try
            {
                // İlgili id'ye sahip consenti al
                var existingConsent = _dataService.GetById(id);

                if (existingConsent == null)
                {
                    return NotFound();
                }

                // Güncellenecek özellikleri atama
                existingConsent.Type = request.Type;
                existingConsent.Recipient = request.Recipient;
                existingConsent.Status = request.Status;
                existingConsent.RecipientType = request.RecipientType;
                existingConsent.CreatedAt = DateTime.UtcNow;

                // DataService üzerinden güncelleme işlemini yap
                _dataService.Update(existingConsent);

                // Başarılı yanıt döndürme
                return Ok(existingConsent);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Consent güncellenirken bir hata oluştu: {ex.Message}");
                return StatusCode(StatusCodes.Status500InternalServerError, "Bir hata oluştu, lütfen daha sonra tekrar deneyin.");
            }
        }
    }
}
