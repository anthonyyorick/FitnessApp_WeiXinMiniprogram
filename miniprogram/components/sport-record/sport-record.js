Component({
  properties: {
    id: {
      type: String,
      value: ''
    },
    typeIcon: {
      type: String,
      value: '🏃'
    },
    typeName: {
      type: String,
      value: '运动'
    },
    distance: {
      type: Number,
      value: 0
    },
    duration: {
      type: Number,
      value: 0
    },
    calories: {
      type: Number,
      value: 0
    },
    steps: {
      type: Number,
      value: 0
    },
    time: {
      type: String,
      value: ''
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