# Marketing Calculator

An interactive marketing calculator that helps clients estimate their potential reach, clicks, and conversions based on their chosen platform and budget.

## Features

- Platform selection (Meta, Google, TikTok)
- Budget customization
- Campaign number selection
- Real-time results visualization
- Interactive charts
- Smooth animations
- Responsive design

## How to Use

1. Choose your advertising platform
2. Set your monthly budget
3. Select the number of campaigns
4. View your estimated results

## Integration with Wix

To integrate this calculator with your Wix website:

1. Upload all files to your Wix site's media manager
2. Add an HTML iframe element to your Wix page
3. Set the iframe source to the location of your `index.html` file
4. Adjust the iframe dimensions to fit your page layout

Example iframe code:
```html
<iframe 
    src="path/to/your/index.html" 
    width="100%" 
    height="800px" 
    frameborder="0"
    scrolling="no">
</iframe>
```

## Customization

You can customize the calculator by:

1. Modifying the metrics in `script.js`:
   - Update the `platformMetrics` object with your own CTR, CPC, and conversion rates
   - Adjust the budget range in the HTML
   - Modify the number of campaigns allowed

2. Styling in `styles.css`:
   - Change colors in the `:root` variables
   - Adjust sizes and spacing
   - Modify animations and transitions

## Dependencies

- Chart.js for data visualization
- GSAP for smooth animations

## Support

For any questions or customization needs, please contact your developer.

## License

This calculator is provided for use with your Wix website. Please do not redistribute or resell. 