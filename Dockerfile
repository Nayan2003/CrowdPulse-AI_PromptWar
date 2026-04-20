# Use nginx to serve the Angular app
FROM nginx:alpine

# Copy the built app to nginx html directory
COPY dist/crowdpulse-ai/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 8080
EXPOSE 8080

# Start nginx
CMD ["nginx", "-g", "daemon off;"]