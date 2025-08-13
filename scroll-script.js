document.addEventListener('DOMContentLoaded', () => {
    const scrollToTopButton = document.querySelector('.scroll-to-top');
    const progressRing = document.querySelector('.progress-ring-circle');
    const radius = progressRing.r.baseVal.value;
    const circumference = 2 * Math.PI * radius;
    progressRing.style.strokeDasharray = `${circumference} ${circumference}`;
    progressRing.style.strokeDashoffset = circumference;

    function updateScrollProgress() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        // Aggressive height reset and reflow
        document.documentElement.style.height = 'auto !important';
        document.body.style.height = 'auto !important';

        const reflow = document.body.offsetHeight; // Force reflow
        const scrollHeight = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight, document.body.offsetHeight);
        const clientHeight = document.documentElement.clientHeight;
        const scrollableHeight = Math.max(0, scrollHeight - clientHeight);
        const scrollPercent = scrollableHeight > 0 ? (scrollTop / scrollableHeight) * 100 : 0;

        console.log(`Scroll: ${scrollTop}px, ScrollHeight: ${scrollHeight}px, ClientHeight: ${clientHeight}px, Scrollable: ${scrollableHeight}px, Percent: ${scrollPercent.toFixed(1)}%, Offset: ${(circumference - (scrollPercent / 100) * circumference).toFixed(1)}`);

        const offset = circumference - (scrollPercent / 100) * circumference;
        progressRing.style.strokeDashoffset = offset;

        if (scrollTop > 100) {
            scrollToTopButton.style.opacity = '1';
            scrollToTopButton.style.pointerEvents = 'auto';
        } else {
            scrollToTopButton.style.opacity = '0';
            scrollToTopButton.style.pointerEvents = 'none';
        }
    }

    setTimeout(() => {
        document.body.style.display = 'block';
        window.dispatchEvent(new Event('resize'));
        updateScrollProgress();
        window.addEventListener('scroll', updateScrollProgress);
    }, 1500);


    $(document).ready(function() {
        scrollToTopButton.addEventListener('click', function(event) {
            event.preventDefault(); 
            $('html, body').animate({
                scrollTop: 0 
            }, 600, function() {
               
            });
        });
    });
});