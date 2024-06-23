const apiUrl = 'https://localhost:44338/api/Consents';
const batchSize = 10; // Her bir istekte alınacak veri sayısı
let currentStartIndex = 1; // Başlangıç indeksi

// DOMContentLoaded eventini dinleyerek JavaScript kodunu çalıştırma
document.addEventListener('DOMContentLoaded', processAllData);

// Tüm verileri alıp işleyen fonksiyon
async function processAllData() {
    try {
        let totalCount = await getTotalConsentCount();
        console.log('Toplam consent sayısı:', totalCount);

        while (currentStartIndex <= totalCount) {
            const consents = await fetchAndProcessData(currentStartIndex);
            consents.forEach(consent => {
                addConsentToTable(consent);
            });
            currentStartIndex += batchSize;

            // Her 10 veride bir ekstra satır ekle
            if (currentStartIndex % batchSize === 1) { // currentStartIndex 1, 11, 21, ... olduğunda ekstra satır ekle
                addExtraRow();
            }
        }

        console.log("Tüm veriler işlendi.");
    } catch (error) {
        console.error('Tüm verileri işleme sırasında hata oluştu:', error);
    }
}

// Belirli bir adet veri al ve işle
async function fetchAndProcessData(startIndex) {
    try {
        const response = await fetch(`${apiUrl}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                startId: startIndex,
                count: batchSize
            })
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const consents = await response.json();

        consents.sort((a, b) => b.id - a.id);
        return consents;

    } catch (error) {
        console.error('Fetch işlemi sırasında hata oluştu:', error);
        throw error;
    }
}

// Tüm consent veri sayısını al
async function getTotalConsentCount() {
    try {
        const response = await fetch(`${apiUrl}`, {
            method: 'GET'
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        return data.length; // Toplam veri sayısını döndür
    } catch (error) {
        console.error('Toplam veri sayısı alınırken hata oluştu:', error);
        throw error;
    }
}

function openUpdateModal() {
    // Popup'ı aç
    var modal = document.getElementById('updateModal');
    modal.style.display = 'block';
}

function closeUpdateModal() {
    var modal = document.getElementById('updateModal');
    modal.style.display = 'none';
}

function updateConsent() {
    // Güncelleme işlemleri burada yapılacak
    var consentId = document.getElementById('updateConsentId').value;
    var type = document.getElementById('type').value;
    var recipient = document.getElementById('recipient').value;
    var status = document.getElementById('status').value;
    var recipientType = document.getElementById('recipientType').value;

    var updatedConsentData = {
        id: parseInt(consentId),
        type: type,
        recipient: recipient,
        status: status,
        recipientType: recipientType
    };

    console.log(updatedConsentData)

    // API'ye PUT isteği gönder
    fetch(`https://localhost:44338/api/Consents/${consentId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedConsentData)
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            console.log('Consent başarıyla güncellendi.');

            updateConsentInTable(updatedConsentData);
            // Modalı kapat
            closeUpdateModal();
        })
        .catch(error => {
            console.error('Consent güncelleme işlemi sırasında hata oluştu:', error);
            // Hata durumunda gerekli işlemler yapılabilir
        });

    // Modalı kapat
    updateConsentInTable(updatedConsentData);
    closeUpdateModal();
}

function updateConsentInTable(updatedData) {
    const consentsTableBody = document.getElementById('consents-table-body');

    if (!consentsTableBody) {
        console.error('Consents table body element not found');
        return;
    }

    const rows = consentsTableBody.getElementsByTagName('tr');
    for (let i = 0; i < rows.length; i++) {
        const cell = rows[i].getElementsByTagName('td')[0];
        if (cell && cell.textContent == updatedData.id) {
            rows[i].innerHTML = `
                <td>${updatedData.id}</td>
                <td>${updatedData.type}</td>
                <td>${updatedData.recipient}</td>
                <td>${updatedData.status ? updatedData.status : 'Belirtilmemiş'}</td>
                <td>${updatedData.recipientType ? updatedData.recipientType : 'Belirtilmemiş'}</td>
            `;
            break;
        }
    }
}

function openAddModal() {
    var modal = document.getElementById('addModal');
    modal.style.display = 'block';
}

// Function to close modal
function closeAddModal() {
    var modal = document.getElementById('addModal');
    modal.style.display = 'none';
}

// Function to submit consent form
function submitConsent() {
    var type = document.getElementById('AddType').value;
    var recipient = document.getElementById('AddRecipient').value;
    var status = document.getElementById('AddStatus').value;
    var recipientType = document.getElementById('AddRecipientType').value;

    // Kullanıcıdan alınan değerlerin doğruluğunu kontrol etmek için console.log() ile yazdırabiliriz
    console.log('Type:', type);
    console.log('Recipient:', recipient);
    console.log('Status:', status);
    console.log('Recipient Type:', recipientType);

    var consentData = {
        type: type,
        recipient: recipient,
        status: status,
        recipientType: recipientType
    };

    // API'ye POST isteği gönder
    fetch('https://localhost:44338/api/Consents/add', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(consentData)
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log('Consent successfully added:', data);

            addConsentToTable(data);
            // Modalı kapat
            closeAddModal();
        })
        .catch(error => {
            console.error('Error adding consent:', error);
            // Handle error, e.g., show error message to user
        });
}

// Consent silme işlemi için fonksiyon

function openDeleteModal() {
    var modal = document.getElementById('deleteModal');
    modal.style.display = 'block';
}

// Function to close modal
function closeDeleteModal() {
    var modal = document.getElementById('deleteModal');
    modal.style.display = 'none';
}

// Consent silme işlemi için fonksiyon
async function deleteConsent(consentId) {
    try {
        var consentId = document.getElementById('deleteConsentId').value;
        const response = await fetch(`${apiUrl}/${consentId}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        // Silme işlemi başarılı ise tüm verileri güncelle
        currentStartIndex = 0; // Başlangıç indeksini sıfırla
        

    } catch (error) {
        console.error('Silme işlemi sırasında hata oluştu:', error);
    }
    removeConsentFromTable(consentId);
    await processAllData();
    closeDeleteModal();
}

function removeConsentFromTable(consentId) {
    const consentsTableBody = document.getElementById('consents-table-body');

    if (!consentsTableBody) {
        console.error('Consents table body element not found');
        return;
    }

    const rows = consentsTableBody.getElementsByTagName('tr');
    for (let i = 0; i < rows.length; i++) {
        const cell = rows[i].getElementsByTagName('td')[0];
        if (cell && cell.textContent == consentId) {
            consentsTableBody.removeChild(rows[i]);
            break;
        }
    }
}
// HTML tablosuna consent verisini ekleyen fonksiyon
function addConsentToTable(consent) {
    const consentsTableBody = document.getElementById('consents-table-body');

    if (!consentsTableBody) {
        console.error('Consents table body element not found');
        return;
    }

    const row = document.createElement('tr');
    row.innerHTML = `
        <td>${consent.id}</td>
        <td>${consent.type}</td>
        <td>${consent.recipient}</td>
        <td>${consent.status ? consent.status : 'Belirtilmemiş'}</td>
        <td>${consent.recipientType ? consent.recipientType : 'Belirtilmemiş'}</td>
    `;

    // Tabloya en alt satıra ekleyelim
    consentsTableBody.appendChild(row);
}

// Her 10 veride bir ekstra satır ekleyen fonksiyon
function addExtraRow() {
    const consentsTableBody = document.getElementById('consents-table-body');

    if (!consentsTableBody) {
        console.error('Consents table body element not found');
        return;
    }

    const extraRow = document.createElement('tr');
    extraRow.innerHTML = `
        <td></td> <!-- Boş alan -->
        <td></td> <!-- Boş alan -->
        <td>${getCurrentDateTime()}</td> <!-- Şu anki tarih ve saati ekle -->
        <td></td> <!-- Boş alan -->
        <td></td> <!-- Boş alan -->
    `;
    consentsTableBody.appendChild(extraRow);
}

// Şu anki tarih ve saati döndüren yardımcı fonksiyon
function getCurrentDateTime() {
    const currentDate = new Date();
    const formattedTime = `${currentDate.getHours()}:${currentDate.getMinutes()}:${currentDate.getSeconds()}`;
    return formattedTime;
}