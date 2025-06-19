document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded');

    const first = document.querySelector('.h-first');
    const firstTitle = first.querySelector('.h-first__title');
    const firstTitleSpan = firstTitle.querySelectorAll('span');
    const firstTitleSpan1 = firstTitleSpan[0];
    const firstTitleSpan2 = firstTitleSpan[1];

    firstTitleSpan1.addEventListener('mouseenter', () => {
        firstTitleSpan1.classList.add('h-first__title_active');
    });

    firstTitleSpan2.addEventListener('mouseenter', () => {
        firstTitleSpan2.classList.add('h-first__title_active');
    });

    firstTitleSpan1.addEventListener('mouseleave', () => {
        firstTitleSpan1.classList.remove('h-first__title_active');
    });

    firstTitleSpan2.addEventListener('mouseleave', () => {
        firstTitleSpan2.classList.remove('h-first__title_active');
    });
});
