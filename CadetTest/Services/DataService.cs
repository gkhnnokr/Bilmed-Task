using CadetTest.Entities;
using CadetTest.Helpers;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CadetTest.Services
{
    public interface IDataService
    {
        string GetRandomString(int stringLength);
        void InitConsents();
        List<Consent> GetRangeById(int id, int count);
        void Delete(Consent consent);
        Consent GetById(int id);
        void Add(Consent consent);
        List<Consent> GetAllConsents();
        void Update(Consent consent);
    }

    public class DataService : IDataService
    {
        private DataContext _context;
        private readonly AppSettings _appSettings;
        private readonly ILogger<UserService> _logger;
        private Random _random;
        public DataService(DataContext context, IOptions<AppSettings> appSettings, ILogger<UserService> logger)
        {
            _context = context;
            _appSettings = appSettings.Value;
            _logger = logger;

            _random = new Random();
        }

        #region Public Methods
        #endregion


        public void InitConsents()
        {
            if (_context.Consents.Any()) return;

            for (int i = 1; i < _appSettings.ConsentCount; i++)
            {
                var consent = new Consent
                {
                    Recipient = $"{GetRandomString(10)}_{i}@ornek.com",
                    RecipientType = "EPOSTA",
                    Status = "ONAY",
                    Type = "EPOSTA"
                };

                _context.Consents.Add(consent);
            }
        }
        #region Private Methods

        public List<Consent> GetAllConsents()
        {
            return _context.Consents.ToList();
        }
        public string GetRandomString(int stringLength)
        {
            var sb = new StringBuilder();
            int numGuidsToConcat = (((stringLength - 1) / 32) + 1);
            for (int i = 1; i <= numGuidsToConcat; i++)
            {
                sb.Append(Guid.NewGuid().ToString("N"));
            }

            return sb.ToString(0, stringLength);
        }
        #endregion

        public List<Consent> GetRangeById(int id, int count)
        {
            return _context.Consents.Where(c => c.Id >= id).Take(count).ToList();
        }

        public void Delete(Consent consent)
        {
            _context.Consents.Remove(consent);
            _context.SaveChanges();
        }

        public Consent GetById(int id)
        {
            return _context.Consents.FirstOrDefault(c => c.Id == id);
        }

        public void Add(Consent consent)
        {
            _context.Consents.Add(consent);
            _context.SaveChanges();
        }

        public void Update(Consent consent)
        {
            // Güncelleme işlemi
            var existingConsent = _context.Consents.FirstOrDefault(c => c.Id == consent.Id);
            if (existingConsent != null)
            {
                existingConsent.Type = consent.Type;
                existingConsent.Recipient = consent.Recipient;
                existingConsent.Status = consent.Status;
                existingConsent.RecipientType = consent.RecipientType;
                existingConsent.CreatedAt = consent.CreatedAt; // Örnek olarak CreatedAt'i de güncelliyoruz

                _context.SaveChanges(); // Değişiklikleri veritabanına kaydet
            }
        }

    }

}
