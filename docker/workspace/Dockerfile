FROM php:8.4-cli-alpine

# System dependencies + Node.js
RUN apk add --no-cache \
    git curl zip unzip bash shadow \
    libpng-dev oniguruma-dev libxml2-dev \
    freetype-dev libjpeg-turbo-dev libzip-dev \
    icu-dev linux-headers \
    nodejs npm

# PHP extensions (same set as phpfpm)
RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install \
        pdo pdo_mysql mbstring exif pcntl bcmath gd zip intl opcache

#RUN pecl install redis && docker-php-ext-enable redis

# Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Keep container alive for exec-based usage
CMD ["tail", "-f", "/dev/null"]
