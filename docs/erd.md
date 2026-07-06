# Tiny Market 데이터베이스 설계

## User
- id
- email
- passwordHash
- nickname
- role: USER | ADMIN
- balance
- status: ACTIVE | BLOCKED
- createdAt
- updatedAt

## Product
- id
- sellerId
- title
- description
- price
- imageUrl
- status: SELLING | RESERVED | SOLD | BLOCKED
- createdAt
- updatedAt

## ChatRoom
- id
- productId
- buyerId
- sellerId
- createdAt

## Message
- id
- chatRoomId
- senderId
- content
- createdAt

## Transfer
- id
- senderId
- receiverId
- amount
- createdAt

## UserBlock
- id
- blockerId
- blockedId
- createdAt