# Authentication Examples

## Overview

This guide provides examples of how to authenticate with the MyLibaas API using different programming languages and frameworks.

## JavaScript/TypeScript

### Using Fetch API
```javascript
const login = async (email, password) => {
  try {
    const response = await fetch('https://api.mylibaas.com/v1/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      throw new Error('Authentication failed');
    }

    const data = await response.json();
    return data.token;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

// Usage
const token = await login('user@example.com', 'password');
```

### Using Axios
```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://api.mylibaas.com/v1'
});

const login = async (email, password) => {
  try {
    const { data } = await api.post('/auth/login', {
      email,
      password
    });
    return data.token;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};
```

## Python

### Using Requests
```python
import requests

def login(email, password):
    try:
        response = requests.post(
            'https://api.mylibaas.com/v1/auth/login',
            json={'email': email, 'password': password}
        )
        response.raise_for_status()
        return response.json()['token']
    except requests.exceptions.RequestException as e:
        print(f'Login error: {e}')
        raise

# Usage
token = login('user@example.com', 'password')
```

## Ruby

### Using Net::HTTP
```ruby
require 'net/http'
require 'json'

def login(email, password)
  uri = URI('https://api.mylibaas.com/v1/auth/login')
  request = Net::HTTP::Post.new(uri)
  request['Content-Type'] = 'application/json'
  request.body = {
    email: email,
    password: password
  }.to_json

  response = Net::HTTP.start(uri.hostname, uri.port, use_ssl: true) do |http|
    http.request(request)
  end

  raise 'Authentication failed' unless response.is_a?(Net::HTTPSuccess)
  
  JSON.parse(response.body)['token']
rescue => e
  puts "Login error: #{e.message}"
  raise
end

# Usage
token = login('user@example.com', 'password')
```

## PHP

### Using cURL
```php
function login($email, $password) {
    $ch = curl_init('https://api.mylibaas.com/v1/auth/login');
    
    $data = array(
        'email' => $email,
        'password' => $password
    );
    
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, array(
        'Content-Type: application/json'
    ));
    
    $response = curl_exec($ch);
    
    if (curl_errno($ch)) {
        throw new Exception('Login error: ' . curl_error($ch));
    }
    
    curl_close($ch);
    
    $data = json_decode($response, true);
    return $data['token'];
}

// Usage
try {
    $token = login('user@example.com', 'password');
} catch (Exception $e) {
    echo $e->getMessage();
}
```

## Using the Token

Once you have obtained the token, include it in subsequent API requests:

### JavaScript
```javascript
const api = axios.create({
  baseURL: 'https://api.mylibaas.com/v1',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

// Make authenticated requests
const items = await api.get('/items');
```

### Python
```python
headers = {
    'Authorization': f'Bearer {token}'
}
response = requests.get('https://api.mylibaas.com/v1/items', headers=headers)
```

### Ruby
```ruby
request = Net::HTTP::Get.new(uri)
request['Authorization'] = "Bearer #{token}"
```

### PHP
```php
curl_setopt($ch, CURLOPT_HTTPHEADER, array(
    'Authorization: Bearer ' . $token,
    'Content-Type: application/json'
));
```

## Error Handling

Always implement proper error handling:

```javascript
try {
  const token = await login(email, password);
} catch (error) {
  if (error.response) {
    switch (error.response.status) {
      case 401:
        console.error('Invalid credentials');
        break;
      case 429:
        console.error('Too many attempts');
        break;
      default:
        console.error('Authentication failed');
    }
  }
}
```

## Security Best Practices

1. Never store tokens in localStorage (use secure cookies)
2. Implement token refresh mechanism
3. Use HTTPS for all requests
4. Implement rate limiting
5. Monitor for suspicious activities
