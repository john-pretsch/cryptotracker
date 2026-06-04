FROM php:8.4-fpm-alpine

# System dependencies
RUN apk add --no-cache \
    git curl zip unzip bash \
    libpng-dev oniguruma-dev libxml2-dev \
    freetype-dev libjpeg-turbo-dev libzip-dev \
    icu-dev linux-headers

# PHP extensions
RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install \
        pdo pdo_mysql mbstring exif pcntl bcmath gd zip intl opcache

# Redis extension via PECL
#RUN pecl install redis && docker-php-ext-enable redis

# Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# OPcache tuning for production-ready performance
COPY docker/phpfpm/opcache.ini /usr/local/etc/php/conf.d/opcache.ini

WORKDIR /var/www/html

# Ensure storage & cache dirs are writable by www-data
RUN chown -R www-data:www-data /var/www/html

EXPOSE 9000
