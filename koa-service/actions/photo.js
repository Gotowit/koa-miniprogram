const photo = require('../lib/db/photo')
const album = require('../lib/db/album')
module.exports = {
  async getPhotos (userId, albumId, pageIndex, pageSize) {
    const [count, photos] = await Promise.all([photo.getPhotosCount(userId, albumId), photo.getPhotos(userId, albumId, pageIndex, pageSize)])
    return {
      count, 
      data: photos
    }
  },
  async getApprovingPhotos (pageIndex, pageSize) {
    const [count, photos] = await Promise.all([photo.getApprovingPhotosCount(), photo.getApprovingPhotos(pageIndex, pageSize)])
    return {
      count,
      data: photos
    }
  },
  async getPhotosByApproveState (type, pageIndex, pageSize) {
    switch (type) {
      case 'pending':
        const [count, photos] = await Promise.all([photo.getApprovingPhotosCount(), photo.getApprovingPhotos(pageIndex, pageSize)])
        return {
          count,
          data: photos
        }
      case 'accepted':
        const [count, photos] = await Promise.all([photo.getUnApprovedPhotosCount(), photo.getApprovedPhotos(pageIndex, pageSize)])
        return {
          count,
          data: photos
        }
      case 'reject':
        const [count, photos] = await Promise.all([photo.getUnApprovedPhotosCount(), photo.getUnApprovedPhotos(pageIndex, pageSize)])
        return {
          count,
          data: photos
        }
    }
  },
  async getAll (pageIndex, pageSize) {
    const [count, photos] = await Promise.all([photo.getAllCount(), photo.getAll(pageIndex, pageSize)])
    return {
      count, 
      data: photos
    }
  },
  async approve (id, state) {
    return photo.approve(id, state)
  },
  async delete (id) {
    return photo.delete(id)
  },
  async add (userId, url, albumId) {
    return photo.add(userId, url, albumId)
  },
  async getPhotoById (id) {
    return photo.getPhotoById(id)
  },
  async getAlbums (userId, pageIndex, pageSize) {
    let albums, count
    if (pageSize) {
      [albums, count] = await Promise.all([album.getAlbumsCount(userId), album.getAlbums(userId, pageIndex, pageSize)])
    } else {
      albums = await album.getAlbums(userId)
    }
    let result = await Promise.all(albums.map(async function (item) {
      const id = item._id
      let ps = await photo.getPhotosByAlbumId(id)
      return Object.assign({
        photoCount: ps.length,
        fm: ps[0] ? ps[0].url : null
      }, item.toObject())
    }))
    if (count) {
      return {
        count,
        data: result
      }
    }
    return result
  },
  async addAlbum (userId, name) {
    return album.add(userId, name)
  },
  async updateAlbum (id, name) {
    return album.update(id, name)
  },
  async deleteAlbum (id) {
    const photos = await photo.getPhotosByAlbumId(id)
    if (photos.length) {
      throw new Error('相册还存在相片，不允许删除')
    }
    return album.delete(id)
  }
}
