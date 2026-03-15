Component({
  properties: {
    id: {
      type: String,
      value: ''
    },
    title: {
      type: String,
      value: ''
    },
    description: {
      type: String,
      value: ''
    },
    duration: {
      type: Number,
      value: 0
    },
    level: {
      type: String,
      value: ''
    },
    cover: {
      type: String,
      value: ''
    },
    views: {
      type: Number,
      value: 0
    }
  },

  methods: {
    onTap() {
      this.triggerEvent('tap', {
        id: this.data.id
      });
    }
  }
}); 