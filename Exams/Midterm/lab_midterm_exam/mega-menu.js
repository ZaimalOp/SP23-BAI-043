// Get the mega menu trigger and menu elements
const trigger = document.querySelector('.mega-menu-trigger');
const megaMenu = document.querySelector('.mega-menu');

// Toggle Mega Menu on click
trigger.addEventListener('click', (e) => {
    e.preventDefault(); // Prevent default anchor behavior (e.g., jumping to #)
    
    // Toggle the 'active' class to show/hide the mega menu
    megaMenu.classList.toggle('active');
});

// Close Mega Menu when clicking outside
document.addEventListener('click', (e) => {
    // Check if the click was outside the trigger element
    if (!trigger.contains(e.target)) {
        megaMenu.classList.remove('active');
    }
});