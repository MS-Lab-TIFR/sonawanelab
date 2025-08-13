document.addEventListener('DOMContentLoaded', () => {
    const hamburger = document.querySelector('.hamburger');
    const mobileMenu = document.querySelector('.mobile-menu');

    function toggleMenu() {
        mobileMenu.classList.toggle('show');
        hamburger.classList.toggle('open');

        // Toggle aria-expanded attribute for accessibility
        const isExpanded = hamburger.getAttribute('aria-expanded') === 'true';
        hamburger.setAttribute('aria-expanded', !isExpanded);

        // Change hamburger icon to cross and back
        if (mobileMenu.classList.contains('show')) {
            hamburger.innerHTML = '&#x2715;'; // Cross icon
        } else {
            hamburger.innerHTML = '&#9776;'; // Hamburger icon
        }
    }

    hamburger.addEventListener('click', toggleMenu);

    // Optional: Close menu when a menu item is clicked
    const menuLinks = document.querySelectorAll('.mobile-menu ul li a');
    menuLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (mobileMenu.classList.contains('show')) {
                toggleMenu();
            }
        });
    });
});


//Script for parsing Publication data from googlesheet
document.addEventListener('DOMContentLoaded', () => {
    const LOCAL_CSV_FILE_PATH = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTytXtnbfgnmZu53Dk2A9pzJlYGQhirjrMhVLk-t9xP-AYD8Niz4Rb9oG_lpEKBdU3QklaIZSxIetSf/pub?output=csv';
    const publicationContainer = document.getElementById('publication-list-container');

    if (!publicationContainer) {
        console.error("Error: Could not find element with ID 'publication-list-container'.");
        return;
    }

    function parseCSV(csvText) {
        const parsed = Papa.parse(csvText, {
            header: true,
            skipEmptyLines: true,
            transform: value => value.trim()
        });
        console.log('Parsed CSV data:', parsed.data);
        return parsed.data;
    }

    const timestamp = new Date().getTime();
    const cacheBustedUrl = `${LOCAL_CSV_FILE_PATH}&t=${timestamp}`;

    fetch(cacheBustedUrl, {
            cache: 'no-store'
        })
        .then(response => {
            publicationContainer.innerHTML = '<p>Loading publications...</p>';
            if (!response.ok) {
                let errorMessage = `HTTP error! Status: ${response.status}`;
                if (response.status === 404) {
                    errorMessage += ". File not found.";
                }
                throw new Error(errorMessage);
            }
            return response.text();
        })
        .then(csvText => {
            console.log('Raw CSV content:', csvText);
            const publications = parseCSV(csvText);
            publicationContainer.innerHTML = '';

            if (publications.length === 0) {
                publicationContainer.innerHTML = '<p>No recent publications at the moment.</p>';
                return;
            }

            publications.forEach(pub => {
                if (pub.Title && pub.Author && pub.Journal && pub.Link_Image && pub.Link_Paper) {
                    const pubParagraph = document.createElement('div');
                    pubParagraph.innerHTML = `
                    <a href="${pub.Link_Paper}" target="_blank">
                    <div class="article-box" >
                        <div class="article-image" style="background-image: url('${pub.Link_Image}');"></div>
                    <div class="article-info">
                        <h3>${pub.Title} <span>&#x2197;</span></h3>
                        <p>${pub.Author}</br>
                        ${pub.Journal}</p>
                    </div>
                    </div>
                    </a>`;
                    publicationContainer.appendChild(pubParagraph);
                } else {
                    console.warn("Skipping a publication row due to missing required fields:", pub);
                }
            });
        })
        .catch(error => {
            console.error('Error fetching or parsing publication data:', error);
            publicationContainer.innerHTML = `<p>Failed to load publication information: ${error.message}.</p>`;
        });
})
// For research related publications
document.addEventListener('DOMContentLoaded', () => {
    const LOCAL_CSV_FILE_PATH = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQ91WO67oPlFJKozSf828oHRyWUEn7tb_JdjLq21gXvlUFNFXTSHGpUwIFd_bvBCe2MZrZqK95Qd6il/pub?output=csv';

    const tabContainers = {
        'tissue-homeostasis': document.getElementById('tissue-homeostasis'),
        'cell-polarity': document.getElementById('cell-polarity'),
        'actin-microridge': document.getElementById('actin-microridge'),
        'developmental-metabolism': document.getElementById('developmental-metabolism')
    };

    Object.values(tabContainers).forEach(container => {
        if (!container) {
            console.error(`Error: Could not find element with id '${Object.keys(tabContainers).find(key => tabContainers[key] === container)}'.`);
            return;
        }
        let pubDiv = container.querySelector('.content-pub');
        if (!pubDiv) {
            pubDiv = document.createElement('div');
            pubDiv.className = 'content-pub';
            pubDiv.innerHTML = '<h2>Related Publications</h2>';
            container.appendChild(pubDiv);
        }
        pubDiv.innerHTML = '<h2>Related Publications</h2><p>Loading publications...</p>';
    });

    function parseCSV(csvText) {
        const parsed = Papa.parse(csvText, {
            header: true,
            skipEmptyLines: true,
            transform: value => (value || '').trim() // Handle empty values
        });
        console.log('Parsed CSV data:', parsed.data);
        return parsed.data;
    }

    const timestamp = new Date().getTime();
    const cacheBustedUrl = `${LOCAL_CSV_FILE_PATH}&t=${timestamp}`;

    fetch(cacheBustedUrl, {
            cache: 'no-store'
        })
        .then(response => {
            if (!response.ok) {
                let errorMessage = `HTTP error! Status: ${response.status}`;
                if (response.status === 404) {
                    errorMessage += ". File not found.";
                }
                throw new Error(errorMessage);
            }
            return response.text();
        })
        .then(csvText => {
            console.log('Raw CSV content:', csvText);
            const publications = parseCSV(csvText);
            Object.values(tabContainers).forEach(container => {
                let pubDiv = container.querySelector('.content-pub');
                pubDiv.innerHTML = '<h2>Related Publications</h2>';
            });

            if (publications.length === 0) {
                Object.values(tabContainers).forEach(container => {
                    let pubDiv = container.querySelector('.content-pub');
                    pubDiv.innerHTML = '<h2>Related Publications</h2><p>No recent publications at the moment.</p>';
                });
                return;
            }

            const categoryMap = {
                'tissue-homeostasis': 'Homeostasis',
                'cell-polarity': 'Polarity',
                'actin-microridge': 'Microridges',
                'developmental-metabolism': 'Metabolism'
            };

            const publicationsByCategory = {};
            const currentYear = new Date().getFullYear(); // 2025

            publications.forEach(pub => {
                const title = (pub.Title || '').trim();
                const authors = (pub.Authors || '').replace('*', '').trim();
                const journal = (pub.Journal || '').trim();
                const link = (pub.Link || '').trim();
                const year = (pub.Year || '').trim();
                const category = (pub.Category || '').trim();

                if (title && authors && journal && link && year && category) {
                    const pubYear = Number(year);

                    if (categoryMap[Object.keys(categoryMap).find(key => categoryMap[key] === category)]) {
                        if (!publicationsByCategory[category]) {
                            publicationsByCategory[category] = [];
                        }
                        publicationsByCategory[category].push({ Title: title, Authors: authors, Journal: journal, Link: link, Year: year });
                    } else {
                        console.warn("Skipping publication due to unmatched category:", { Title: title, Category: category });
                    }
                } else {
                    console.warn("Skipping a publication row due to missing required fields:", { Title: title, Authors: authors, Journal: journal, Link: link, Year: year, Category: category });
                }
            });

            Object.entries(categoryMap).forEach(([tabId, category]) => {
                const container = tabContainers[tabId];
                let pubDiv = container.querySelector('.content-pub');
                if (!publicationsByCategory[category] || publicationsByCategory[category].length === 0) {
                    pubDiv.innerHTML = '<h2>Related Publications</h2><p>No publications in this category.</p>';
                    return;
                }

                const sortedPublications = publicationsByCategory[category].sort((a, b) => {
                    const yearA = Number(a.Year);
                    const yearB = Number(b.Year);
                    return yearB - yearA; // Sort in descending order by year
                });

                const pubList = document.createElement('ul');
                pubList.className = 'pub-block';
                pubDiv.appendChild(pubList);

                sortedPublications.forEach(pub => {
                    const li = document.createElement('li');
                    li.innerHTML = `
                        <a href="${pub.Link}" target="_blank">
                            <span>${pub.Title}</span><br>
                            ${pub.Authors}<br>
                            ${pub.Journal}, ${pub.Year}
                        </a>
                    `;
                    pubList.appendChild(li);
                });
            });
        })
        .catch(error => {
            console.error('Error fetching or parsing publication data:', error);
            Object.values(tabContainers).forEach(container => {
                let pubDiv = container.querySelector('.content-pub');
                pubDiv.innerHTML = `<h2>Related Publications</h2><p>Failed to load publication information: ${error.message}.</p>`;
            });
        });
});
//For main publication parsing
document.addEventListener('DOMContentLoaded', () => {
    const LOCAL_CSV_FILE_PATH = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQ91WO67oPlFJKozSf828oHRyWUEn7tb_JdjLq21gXvlUFNFXTSHGpUwIFd_bvBCe2MZrZqK95Qd6il/pub?output=csv';

    const publicationContainer = document.querySelector('.pub-list-container');

    if (!publicationContainer) {
        console.error("Error: Could not find element with class 'pub-list-container'.");
        return;
    }

    function parseCSV(csvText) {
        const parsed = Papa.parse(csvText, {
            header: true,
            skipEmptyLines: true,
            transform: value => (value || '').trim() // Handle empty values
        });
        console.log('Parsed CSV data:', parsed.data);
        return parsed.data;
    }

    const timestamp = new Date().getTime();
    const cacheBustedUrl = `${LOCAL_CSV_FILE_PATH}&t=${timestamp}`;

    fetch(cacheBustedUrl, {
            cache: 'no-store'
        })
        .then(response => {
            publicationContainer.innerHTML = '<p>Loading publications...</p>';
            if (!response.ok) {
                let errorMessage = `HTTP error! Status: ${response.status}`;
                if (response.status === 404) {
                    errorMessage += ". File not found.";
                }
                throw new Error(errorMessage);
            }
            return response.text();
        })
        .then(csvText => {
            console.log('Raw CSV content:', csvText);
            const publications = parseCSV(csvText);
            publicationContainer.innerHTML = '';

            if (publications.length === 0) {
                publicationContainer.innerHTML = '<p>No recent publications at the moment.</p>';
                return;
            }

            const currentYear = new Date().getFullYear(); // 2025
            const publicationsByRange = {};
            const years = publications.map(pub => Number((pub.Year || '').trim())).filter(year => !isNaN(year));
            const maxYear = Math.max(...years, currentYear); // Use the highest year or current year

            publications.forEach(pub => {
                const title = (pub.Title || '').trim();
                const authors = (pub.Authors || '').replace('*', '').trim(); // Remove * from authors
                const journal = (pub.Journal || '').trim();
                const link = (pub.Link || '').trim();
                const year = (pub.Year || '').trim();

                if (title && authors && journal && link && year) {
                    const pubYear = Number(year);
                    const endYear = Math.min(Math.ceil(pubYear / 5) * 5, maxYear); // Cap at current or max year
                    const startYear = endYear - 4;
                    const yearRange = `${endYear}-${startYear}`;

                    if (!publicationsByRange[yearRange]) {
                        publicationsByRange[yearRange] = [];
                    }
                    publicationsByRange[yearRange].push({ Title: title, Authors: authors, Journal: journal, Link: link, Year: year });
                } else {
                    console.warn("Skipping a publication row due to missing required fields:", { Title: title, Authors: authors, Journal: journal, Link: link, Year: year });
                }
            });

            const sortedYearRanges = Object.keys(publicationsByRange).sort((a, b) => {
                const [aEnd] = a.split('-').map(Number);
                const [bEnd] = b.split('-').map(Number);
                return bEnd - aEnd; // Sort in descending order by end year
            });

            sortedYearRanges.forEach(yearRange => {
                const yearHeader = document.createElement('h2');
                yearHeader.className = 'year-range';
                yearHeader.textContent = yearRange;
                publicationContainer.appendChild(yearHeader);

                const pubList = document.createElement('ul');
                pubList.className = 'pub-block';
                publicationContainer.appendChild(pubList);

                publicationsByRange[yearRange].forEach(pub => {
                    const li = document.createElement('li');
                    li.innerHTML = `
                        <a href="${pub.Link}" target="_blank">
                            <b>${pub.Title}</b><br>
                            ${pub.Authors}<br>
                            ${pub.Journal}, ${pub.Year}
                        </a>
                    `;
                    pubList.appendChild(li);
                });
            });
        })
        .catch(error => {
            console.error('Error fetching or parsing publication data:', error);
            publicationContainer.innerHTML = `<p>Failed to load publication information: ${error.message}.</p>`;
        });
});

//Parsing data for Lab members page
//https://docs.google.com/spreadsheets/d/e/2PACX-1vSny4wbSiFUqJpVYQbOaV19awPyYGm76Z11wbqHjEFqVhEerV_0B10r0kYeSXjKMmnDggShX2fQvcZ5/pub?output=csv

document.addEventListener('DOMContentLoaded', () => {
    const LOCAL_CSV_FILE_PATH = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSny4wbSiFUqJpVYQbOaV19awPyYGm76Z11wbqHjEFqVhEerV_0B10r0kYeSXjKMmnDggShX2fQvcZ5/pub?output=csv';

    const profileContainer = document.querySelector('.profile-container');
    const pastProfileContainer = document.querySelector('.past-profile-container');

    if (!profileContainer || !pastProfileContainer) {
        console.error("Error: Could not find element with class 'profile-container' or 'past-profile-container'.");
        return;
    }

    function parseCSV(csvText) {
        const parsed = Papa.parse(csvText, {
            header: true,
            skipEmptyLines: true,
            transform: value => (value || '').trim()
        });
        console.log('Parsed CSV data:', parsed.data);
        return parsed.data;
    }

    const timestamp = new Date().getTime();
    const cacheBustedUrl = `${LOCAL_CSV_FILE_PATH}&t=${timestamp}`;

    fetch(cacheBustedUrl, {
            cache: 'no-store'
        })
        .then(response => {
            profileContainer.innerHTML = '<p>Loading current members...</p>';
            pastProfileContainer.innerHTML = '<p>Loading past members...</p>';
            if (!response.ok) {
                let errorMessage = `HTTP error! Status: ${response.status}`;
                if (response.status === 404) {
                    errorMessage += ". File not found.";
                }
                throw new Error(errorMessage);
            }
            return response.text();
        })
        .then(csvText => {
            console.log('Raw CSV content:', csvText);
            const members = parseCSV(csvText);
            profileContainer.innerHTML = '';
            pastProfileContainer.innerHTML = '';

            if (members.length === 0) {
                profileContainer.innerHTML = '<p>No members at the moment.</p>';
                pastProfileContainer.innerHTML = '<p>No past members at the moment.</p>';
                return;
            }

            members.forEach(member => {
                // Current members
                const name = (member.Memb_name || '').trim();
                const surname = (member.Memb_surname || '').trim();
                const position = (member.Position || '').trim();
                const email = (member.Email || '').trim();
                const work = (member.Work || '').trim();
                const photoId = (member.Photo_id || '').trim();

                if (name && surname && position && email && work && photoId) {
                    const imageUrl = `https://drive.google.com/thumbnail?id=${photoId}`;
                    console.log(`Loading current member: ${name} ${surname}, URL: ${imageUrl}`);
                    const profileDiv = document.createElement('div');
                    profileDiv.className = 'profile-pic';
                    profileDiv.innerHTML = `
                        <img src="${imageUrl}" alt="${name} ${surname}" 
                             style="border: 2px solid #00ccff; max-width: 100%; height: auto;" 
                             onload="console.log('Image loaded successfully for ${imageUrl}');" 
                             onerror="this.onerror=null; this.src='https://via.placeholder.com/150'; console.log('Image load failed for ${imageUrl}, trying fallback');">
                        <span class="memb-name">${name} ${surname}</span><br>
                        <span class="memb-pos">${position}</span><br>
                        <p>${work}</p><br>
                        <a href="mailto:${email}">&#x2709;</a>
                    `;
                    profileContainer.appendChild(profileDiv);
                }

                // Past members (text-only)
                const pastName = (member.Past_mem_name || '').trim();
                const oldPos = (member.Old_pos || '').trim();
                const currPos = (member.Curr_pos || '').trim();

                if (pastName && oldPos && currPos) {
                    console.log(`Loading past member: ${pastName}`);
                    const pastProfileDiv = document.createElement('div');
                    pastProfileDiv.className = 'past-profile-pic';
                    pastProfileDiv.innerHTML = `
                        <span class="past-memb-name">${pastName}</span><br>
                        <span class="past-old-pos">Past Role: ${oldPos}</span><br>
                        <span class="past-curr-pos">Currently a ${currPos}</span><br>
                    `;
                    pastProfileContainer.appendChild(pastProfileDiv);
                }
            });
        })
        .catch(error => {
            console.error('Error fetching or parsing member data:', error);
            profileContainer.innerHTML = `<p>Failed to load member information: ${error.message}</p>`;
            pastProfileContainer.innerHTML = `<p>Failed to load past member information: ${error.message}</p>`;
        });
});

//Parsing from google drive folder for Lab Gallery

document.addEventListener('DOMContentLoaded', () => {
    const galleryContainer = document.getElementById('gallery-container');
    const imageFolder = 'images/'; // Folder relative to gallery.html

    console.log('Script loaded, DOM ready'); // Debug log

    // Fetch the list of images from the JSON file
    fetch('image-list.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.text(); // Get raw text first for debugging
        })
        .then(text => {
            console.log('Raw JSON response:', text); // Log raw content
            return JSON.parse(text); // Parse to JSON
        })
        .then(imageFiles => {
            if (imageFiles.length === 0) {
                console.log('No images listed in image-list.json'); // Debug log
                galleryContainer.innerHTML = '<p>No images found in image-list.json. Please update the file with your image filenames.</p>';
                return;
            }

            console.log('Image files to process:', imageFiles); // Debug log
            let columnIndex = 0;
            const columns = [document.createElement('div'), document.createElement('div'), document.createElement('div')];
            columns.forEach(col => {
                col.className = 'responsive-container-block img-cont';
                galleryContainer.appendChild(col);
            });

            imageFiles.forEach((filename, index) => {
                const rawSrc = `${imageFolder}${filename}`;
                const encodedSrc = `${imageFolder}${encodeURIComponent(filename).replace(/'/g, "%27").replace(/"/g, "%22")}`;
                const caption = filename.replace(/\.[^/.]+$/, ''); // Remove extension for caption
                console.log(`Attempting to load: ${rawSrc}, Encoded: ${encodedSrc}, Caption: ${caption}`); // Debug log

                const item = document.createElement('div');
                item.className = 'gallery-item'; // New wrapper for image and caption
                const img = document.createElement('img');
                img.className = 'img';
                if (index % 5 === 0 && index > 0) img.className += ' img-big'; // Alternate larger images
                if (index % 3 === 2) img.className += ' img-last'; // Style last in group
                img.src = encodedSrc;
                img.alt = caption;
                img.loading = "lazy";
                img.onload = () => console.log('Image loaded: ${encodedSrc}');
                img.onerror = () => console.error('Image load failed for: ${encodedSrc}', img.src);
                img.style.maxWidth = '100%';
                img.style.height = 'auto';

                const captionDiv = document.createElement('div');
                captionDiv.className = 'gallery-caption';
                captionDiv.textContent = caption;

                item.appendChild(img);
                item.appendChild(captionDiv);
                columns[columnIndex].appendChild(item);

                columnIndex = (columnIndex + 1) % 3; // Cycle through 3 columns
            });

            // Force visibility check
            console.log('Gallery container children:', galleryContainer.children.length); // Debug log
            Array.from(galleryContainer.getElementsByTagName('img')).forEach(img => {
                console.log(`Image src: ${img.src}, Natural width: ${img.naturalWidth}, Display: ${window.getComputedStyle(img).display}`);
            });
        })
        .catch(error => {
            console.error('Error fetching image list:', error.message, 'Stack:', error.stack); // Detailed error
            galleryContainer.innerHTML = '<p>Error loading image list. Check image-list.json and server setup.</p>';
        });

    // Cache-busting to ensure fresh data
    const timestamp = new Date().getTime();
    if (galleryContainer.dataset.loaded !== timestamp) {
        console.log('Clearing and reloading gallery'); // Debug log
        galleryContainer.innerHTML = '';
        galleryContainer.dataset.loaded = timestamp;
    }
});

//Script for reserach page tab animation
 document.addEventListener('DOMContentLoaded', () => {
        const tabsHeader = document.querySelector('.tabs-header');
        const tabContents = document.querySelectorAll('.tab-content');

        tabsHeader.addEventListener('click', (event) => {
            const target = event.target.closest('.tab-button');
            if (!target) return;

            // Remove active class from all tabs and content
            document.querySelectorAll('.tab-button').forEach(tab => tab.classList.remove('active-n'));
            tabContents.forEach(content => content.classList.remove('active-n'));

            // Add active class to the clicked tab
            target.classList.add('active-n');

            // Find the corresponding content and add the active class
            const tabId = target.getAttribute('data-tab');
            const activeContent = document.getElementById(tabId);
            if (activeContent) {
                activeContent.classList.add('active-n');
            }
        });
    });