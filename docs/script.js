document.addEventListener('DOMContentLoaded', async function () {
    document.body.classList.add('noscroll');
    hideLoader();
    
    try {
        const endpoints = await (await fetch('/endpoints')).json();
        const set = await (await fetch('/set')).json();
        
        setContent('api-icon', 'href', set.icon);
        setContent('api-title', 'textContent', set.name.main);
        setContent('api-description', 'textContent', set.description);
        setContent('api-name', 'textContent', set.name.main);
        setContent('api-author', 'textContent', `by ${set.author}`);
        setContent('api-desc', 'textContent', set.description);
        setContent('api-copyright', 'textContent', `© 2025 ${set.name.copyright}. All rights reserved.`);
        setContent('api-info', 'href', set.info_url);
        
        setupApiLinks(set);
        setupApiContent(endpoints);
        setupApiButtonHandlers(endpoints);
        setupSearchFunctionality();
    } catch (error) {
        console.error('Error loading configuration:', error);
    }
    
    function setContent(id, property, value) {
        const element = document.getElementById(id);
        if (element) element[property] = value;
    }
    
    function setupApiLinks(gtw) {
        const apiLinksContainer = document.getElementById('api-links');
        
        apiLinksContainer.innerHTML = '';
        
        if (apiLinksContainer && gtw.links?.length) {
            gtw.links.forEach(link => {
                const linkContainer = document.createElement('div');
                linkContainer.className = 'flex items-center gap-2';
                
                const bulletPoint = document.createElement('div');
                bulletPoint.className = `w-2 h-2 bg-gray-400 rounded-full`;
                
                const linkElement = document.createElement('a');
                linkElement.href = link.url;
                linkElement.textContent = link.name;
                linkElement.className = 'hover:underline';
                linkElement.target = '_blank';
                
                linkContainer.appendChild(bulletPoint);
                linkContainer.appendChild(linkElement);
                
                apiLinksContainer.appendChild(linkContainer);
            });
        }
    }
    
    const pageLoader = document.getElementById('page-loader');
    
    window.addEventListener('load', function() {
        setTimeout(function() {
            const scrollPosition = parseInt(document.body.style.top || '0') * -1;
            document.body.classList.remove('noscroll');
            document.body.style.top = '';
            window.scrollTo(0, scrollPosition);
            pageLoader.style.opacity = '0';
            setTimeout(function() {
                pageLoader.style.display = 'none';
            }, 800);
        }, 1000);
    });
    
    function showLoader() {
        const scrollPosition = window.scrollY;
        document.body.style.top = `-${scrollPosition}px`;
        document.body.classList.add('noscroll');
        pageLoader.style.display = 'flex';
        pageLoader.style.opacity = '1';
    }
    
    function hideLoader() {
        setTimeout(function() {
            const scrollPosition = parseInt(document.body.style.top || '0') * -1;
            document.body.classList.remove('noscroll');
            document.body.style.top = '';
            window.scrollTo(0, scrollPosition);
            pageLoader.style.opacity = '0';
            setTimeout(function() {
                pageLoader.style.display = 'none';
            }, 800);
        }, 1000);
    }
    
    function setupApiContent(gtw) {
        const apiContent = document.getElementById('api-content');
        gtw.endpoints.forEach(category => {
            const categoryHeader = document.createElement('h3');
            categoryHeader.className = 'mb-4 text-xl font-semibold';
            categoryHeader.textContent = category.name;
            apiContent.appendChild(categoryHeader);
    
            const row = document.createElement('div');
            row.className = 'row';
            apiContent.appendChild(row);
    
            const sortedItems = Object.entries(category.items)
                .sort(([, a], [, b]) => (a.name || '').localeCompare(b.name || ''))
                .map(([,item]) => item);
            
            sortedItems.forEach((itemData, index) => {
                const itemName = Object.keys(itemData)[0];
                const item = itemData[itemName];
                const isLastItem = index === sortedItems.length - 1;
                const itemElement = createApiItemElement(itemName, item, isLastItem);
                row.appendChild(itemElement);
            });
        });
    }
    
    function createApiItemElement(itemName, item, isLastItem) {
        const itemDiv = document.createElement('div');
        itemDiv.className = `w-full ${isLastItem ? 'mb-5' : 'mb-2'}`;
        itemDiv.dataset.name = itemName || '';
        itemDiv.dataset.desc = item.desc || '';
    
        const heroSection = document.createElement('div');
        heroSection.className = 'flex items-center justify-between p-4 px-6 bg-gray-50 shadow-sm h-20 border border-gray-500 rounded-md';
    
        const textContent = document.createElement('div');
        textContent.className = 'flex-grow mr-4 overflow-hidden';
        
        const title = document.createElement('h5');
        title.className = 'text-lg font-semibold text-black truncate';
        title.textContent = itemName || 'Unnamed Item';
    
        const description = document.createElement('p');
        description.className = 'text-xs font-medium text-gray-600 truncate';
        description.textContent = item.desc || 'No description';
    
        textContent.appendChild(title);
        textContent.appendChild(description);
    
        const button = document.createElement('button');
        button.className = 'px-4 py-2 text-sm font-medium text-white bg-gray-500 w-13 h-9 flex items-center justify-center hover:bg-gray-700 transition duration-300 flex-shrink-0 get-api-btn rounded'
        button.dataset.apiPath = item.path || '';
        button.dataset.apiName = itemName || '';
        button.dataset.apiDesc = item.desc || '';
        button.textContent = 'GET';
    
        heroSection.appendChild(textContent);
        heroSection.appendChild(button);
        itemDiv.appendChild(heroSection);
    
        return itemDiv;
    }
    
    function setupApiButtonHandlers(gtw) {
        document.addEventListener('click', event => {
            if (event.target.classList.contains('get-api-btn')) {
                const { apiPath, apiName, apiDesc } = event.target.dataset;
    
                const currentItem = gtw.endpoints
                    .flatMap(category => Object.values(category.items))
                    .map(itemData => {
                        const itemName = Object.keys(itemData)[0];
                        return { name: itemName, ...itemData[itemName] };
                    })
                    .find(item => item.path === apiPath && item.name === apiName);
    
                openApiModal(apiName, apiPath, apiDesc);
            }
        });
    }
    
    function setupSearchFunctionality() {
        const searchInput = document.getElementById('api-search');
        if (!searchInput) return;
        
        let originalData = null;
        
        function captureOriginalData() {
            const result = [];
            const categories = document.querySelectorAll('#api-content h3');
            
            categories.forEach(category => {
                const nextElement = category.nextElementSibling;
                if (nextElement && nextElement.classList.contains('row')) {
                    const items = Array.from(nextElement.querySelectorAll('div[data-name]')).map(item => {
                        return {
                            element: item.cloneNode(true),
                            name: item.dataset.name,
                            desc: item.dataset.desc
                        };
                    });
                    
                    result.push({
                        categoryElement: category,
                        rowElement: nextElement,
                        items: items
                    });
                }
            });
            
            return result;
        }
        
        function restoreOriginalData() {
            if (!originalData) return;
            
            originalData.forEach(categoryData => {
                categoryData.categoryElement.classList.remove('hidden');
                const row = categoryData.rowElement;
                row.innerHTML = '';
                
                categoryData.items.forEach((item, index) => {
                    const newItem = item.element.cloneNode(true);
                    newItem.className = index === categoryData.items.length - 1 ? 'w-full mb-5' : 'w-full mb-2';
                    row.appendChild(newItem);
                });
            });
        }
        
        originalData = captureOriginalData();
        
        searchInput.addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase().trim();
            
            if (!searchTerm) {
                restoreOriginalData();
                return;
            }
            
            const categories = document.querySelectorAll('#api-content h3');
            
            categories.forEach(category => {
                category.classList.remove('hidden');
            });
            
            categories.forEach(category => {
                const nextElement = category.nextElementSibling;
                if (nextElement && nextElement.classList.contains('row')) {
                    const row = nextElement;
                    
                    const originalCategoryData = originalData.find(data => data.categoryElement === category);
                    if (!originalCategoryData) return;
                    
                    const visibleItems = [];
                    
                    originalCategoryData.items.forEach(item => {
                        const title = item.name?.toLowerCase() || '';
                        const desc = item.desc?.toLowerCase() || '';
                        
                        if (title.includes(searchTerm) || desc.includes(searchTerm)) {
                            visibleItems.push(item);
                        }
                    });
                    
                    if (visibleItems.length === 0) {
                        category.classList.add('hidden');
                        row.innerHTML = '';
                        return;
                    }
                    
                    row.innerHTML = '';
                    visibleItems.forEach((item, index) => {
                        const newItem = item.element.cloneNode(true);
                        
                        newItem.className = 'w-full mb-2';
                        
                        if (index === visibleItems.length - 1) {
                            newItem.className = 'w-full mb-5';
                        }
                        
                        const button = newItem.querySelector('.get-api-btn');
                        if (button) {
                            button.dataset.apiPath = item.element.querySelector('.get-api-btn')?.dataset.apiPath || '';
                            button.dataset.apiName = item.element.querySelector('.get-api-btn')?.dataset.apiName || '';
                            button.dataset.apiDesc = item.element.querySelector('.get-api-btn')?.dataset.apiDesc || '';
                        }
                        
                        row.appendChild(newItem);
                    });
                }
            });
        });
    }
    
    function openApiModal(name, endpoint, description, method) {
        const modal = document.getElementById('api-modal');
        const modalBackdrop = modal.querySelector('.fixed.inset-0.bg-black');
        const modalContent = modal.querySelector('.relative.z-10');
        const closeModalBtn = document.getElementById('close-modal');
        const submitApiBtn = document.getElementById('submit-api');
        const modalTitle = document.getElementById('modal-title');
        const apiMethod = document.getElementById('api-method');
        const apiDescription = document.getElementById('api-description');
        const paramsContainer = document.getElementById('params-container');
        const responseContainer = document.getElementById('response-container');
        const responseData = document.getElementById('response-data');
        const responseStatus = document.getElementById('response-status');
        const responseTime = document.getElementById('response-time');
        const existingUrlDisplay = document.querySelector('.urlDisplay');
        
        if (existingUrlDisplay) {
            existingUrlDisplay.remove();
        }
        responseContainer.classList.add('hidden');
        responseData.innerHTML = '';
        submitApiBtn.classList.remove('hidden');
        paramsContainer.classList.remove('hidden');
        paramsContainer.innerHTML = '';
        
        modalTitle.textContent = name;
        apiDescription.textContent = description;
        
        const url = new URL(endpoint, window.location.origin);
        const urlParams = url.search ? url.search.substring(1).split('&') : [];
        if (urlParams.length) {
            urlParams.forEach(param => {
                const [key] = param.split('=');
                if (key) {
                    const isOptional = key.startsWith('_');
                    const placeholderText = `Input ${key}${isOptional ? ' (optional)' : ''}`;
                    
                    const paramField = document.createElement('div');
                    paramField.className = 'mb-3';
                    paramField.innerHTML = `
                        <input type='text' id='param-${key}' class='w-full px-3 py-1.5 text-sm text-gray-700 border border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-transparent rounded-md' placeholder='${placeholderText}'>
                        <div id='error-${key}' class='text-red-500 text-xs mt-1 hidden'>This field is required</div>
                    `;
                    paramsContainer.appendChild(paramField);
                }
            });
        } else {
            const placeholderMatch = endpoint.match(/{([^}]+)}/g);
            if (placeholderMatch) {
                placeholderMatch.forEach(match => {
                    const paramName = match.replace(/{|}/g, '');
                    const isOptional = paramName.startsWith('_');
                    const placeholderText = `Enter ${paramName}${isOptional ? ' (optional)' : ''}`;
                    
                    const paramField = document.createElement('div');
                    paramField.className = 'mb-3';
                    paramField.innerHTML = `
                        <input type='text' id='param-${paramName}' class='w-full px-3 py-1.5 text-sm text-gray-700 border border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-transparent rounded-md' placeholder='${placeholderText}'>
                        <div id='error-${paramName}' class='text-red-500 text-xs mt-1 hidden'>This field is required</div>
                    `;
                    paramsContainer.appendChild(paramField);
                });
            }
        }
        
        modal.classList.remove('hidden');
        document.body.classList.add('noscroll');
        
        modal.offsetWidth;
        
        modal.classList.add('opacity-100');
        modalBackdrop.classList.add('opacity-50');
        modalContent.classList.add('scale-100', 'opacity-100');
        
        const closeModal = function() {
            modal.classList.remove('opacity-100');
            modalBackdrop.classList.remove('opacity-50');
            modalContent.classList.remove('scale-100', 'opacity-100');
            
            setTimeout(() => {
                modal.classList.add('hidden');
                document.body.classList.remove('noscroll');
            }, 300);
        };
        
        closeModalBtn.onclick = closeModal;
        
        modal.addEventListener('click', function(event) {
            if (event.target === modal) {
                closeModal();
            }
        });
        
        document.addEventListener('keydown', function(event) {
            if (event.key === 'Escape') {
                closeModal();
            }
        }, { once: true });
        
        submitApiBtn.onclick = async function() {
            let isValid = true;
            
            document.querySelectorAll('[id^="error-"]').forEach(errorElement => {
                errorElement.classList.add('hidden');
            });
            
            if (paramsContainer.children.length > 0) {
                Array.from(paramsContainer.children).forEach(paramDiv => {
                    const input = paramDiv.querySelector('input');
                    const paramName = input.id.replace('param-', '');
                    const paramValue = input.value.trim();
                    const errorElement = document.getElementById(`error-${paramName}`);
                    
                    if (!paramName.startsWith('_') && paramValue === '') {
                        isValid = false;
                        errorElement.classList.remove('hidden');
                        input.classList.add('border-red-500');
                    } else {
                        input.classList.remove('border-red-500');
                    }
                });
            }
            
            if (!isValid) {
                return;
            }
            
            responseContainer.classList.remove('hidden');
            paramsContainer.classList.add('hidden');
            submitApiBtn.classList.add('hidden');
            
            const startTime = Date.now();
            try {
                let apiUrl = endpoint;
                
                if (paramsContainer.children.length > 0) {
                    Array.from(paramsContainer.children).forEach(paramDiv => {
                        const input = paramDiv.querySelector('input');
                        const paramName = input.id.replace('param-', '');
                        const paramValue = input.value;
                        
                        if (paramName.startsWith('_') && paramValue === '') {
                            return;
                        }
                        
                        if (apiUrl.includes(`{${paramName}}`)) {
                            apiUrl = apiUrl.replace(`{${paramName}}`, encodeURIComponent(paramValue));
                        } 
                        else {
                            const urlObj = new URL(apiUrl, window.location.origin);
                            urlObj.searchParams.set(paramName, paramValue);
                            apiUrl = urlObj.pathname + urlObj.search;
                        }
                    });
                }
                const fullUrl = new URL(apiUrl, window.location.origin).href;
                
                const urlDisplayDiv = document.createElement('div');
                urlDisplayDiv.className = 'urlDisplay mb-4 p-3 bg-gray-50 text-xs font-mono overflow-hidden border border-gray-500 rounded-md';
                
                const urlContent = document.createElement('div');
                urlContent.className = 'break-all';
                urlContent.textContent = fullUrl;
                urlDisplayDiv.appendChild(urlContent);
                
                responseContainer.parentNode.insertBefore(urlDisplayDiv, responseContainer);
                
                responseData.innerHTML = 'Loading...';
                
                const requestOptions = {
                    method: 'get',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                };
                
                const response = await fetch(apiUrl, requestOptions);
                const endTime = Date.now();
                const duration = endTime - startTime;
                
                responseStatus.textContent = response.status;
                responseStatus.className = response.ok 
                    ? 'px-2 py-1 text-xs font-medium bg-green-100 text-green-800 mr-2'
                    : 'px-2 py-1 text-xs font-medium bg-red-100 text-red-800 mr-2';
                
                responseTime.textContent = `${duration}ms`;
                
                const contentType = response.headers.get('content-type');
                
                if (contentType && (
                    contentType.includes('image/') || 
                    contentType.includes('video/') || 
                    contentType.includes('audio/') ||
                    contentType.includes('application/octet-stream')
                )) {
                    const blob = await response.blob();
                    const objectUrl = URL.createObjectURL(blob);
                    
                    if (contentType.includes('image/')) {
                        responseData.innerHTML = `<img src='${objectUrl}' alt='Response Image' class='max-w-full h-auto' />`;
                    } else if (contentType.includes('video/')) {
                        responseData.innerHTML = `
                            <video controls class='max-w-full'>
                                <source src='${objectUrl}' type='${contentType}'>
                                Your browser does not support the video tag.
                            </video>`;
                    } else if (contentType.includes('audio/')) {
                        responseData.innerHTML = `
                            <audio controls class='w-full'>
                                <source src='${objectUrl}' type='${contentType}'>
                                Your browser does not support the audio tag.
                            </audio>`;
                    } else {
                        responseData.innerHTML = `
                            <div class='text-center p-4'>
                                <p class='mb-2'>Binary data received (${blob.size} bytes)</p>
                                <a href='${objectUrl}' download='response-data' class='px-4 py-2 bg-blue-500 text-white hover:bg-blue-600'>Download File</a>
                            </div>`;
                    }
                } else if (contentType && contentType.includes('application/json')) {
                    const data = await response.json();
                    const responseText = JSON.stringify(data, null, 2);
                    responseData.innerHTML = `<pre class='whitespace-pre-wrap break-words'>${responseText}</pre>`;
                } else {
                    const responseText = await response.text();
                    responseData.innerHTML = `<pre class='whitespace-pre-wrap break-words'>${responseText}</pre>`;
                }
            } catch (error) {
                const endTime = Date.now();
                const duration = endTime - startTime;
                
                responseStatus.textContent = 'Error';
                responseStatus.className = 'px-2 py-1 text-xs font-medium bg-red-100 text-red-800 mr-2';
                responseTime.textContent = `${duration}ms`;
                responseData.innerHTML = `<pre class='text-red-500'>${error.message}</pre>`;
            }
        };
    }
});
