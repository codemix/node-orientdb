describe("RID Bag", function () {
    describe('Embedded Bag Query', function () {
        before(function () {
          var self = this;
          return CREATE_TEST_DB(this, 'testdb_dbapi_rid_bag_embedded_query')
          .bind(this)
          .then(function () {
            return this.db.class.create('Person', 'V');
          })
          .then(function (Person) {
            this.Person = Person;
            return this.db.class.create('Knows', 'E');
          })
          .then(function (Knows) {
            this.Knows = Knows;
            return this.Person.create({
              name: 'John Smith'
            });
          })
          .then(function (subject) {
            var limit = 10,
                i;
            this.subject = subject;
            this.people = [];
            for (i = 0; i < limit; i++) {
              this.people.push({
                name: 'Friend ' + i
              });
            }
            return this.Person.create(this.people);
          })
          .then(function () {
            return this.db.edge
            .from(this.subject['@rid'])
            .to('SELECT * FROM Person WHERE name LIKE "Friend%"')
            .create('Knows');
          });
        });
        after(function () {
          return DELETE_TEST_DB('testdb_dbapi_rid_bag_embedded_query');
        });

        beforeEach(function () {
          return this.db
            .select()
            .from(this.subject['@rid'])
            .fetch({'*': 2})
            .one()
            .bind(this)
            .then(function (record) {
              this.resolvedBag = record.out_Knows;
            });
        });

        it('should resolve rids in bag', function () {
          this.resolvedBag.should.be.an.instanceOf(Array)
          this.resolvedBag[0]['@class'].should.equal('Person');
        });
    }); 

  describe('Embedded Bag', function () {
    before(function () {
      var self = this;
      return CREATE_TEST_DB(this, 'testdb_dbapi_rid_bag_embedded')
      .bind(this)
      .then(function () {
        return this.db.class.create('Person', 'V');
      })
      .then(function (Person) {
        this.Person = Person;
        return this.db.class.create('Knows', 'E');
      })
      .then(function (Knows) {
        this.Knows = Knows;
        return this.Person.create({
          name: 'John Smith'
        });
      })
      .then(function (subject) {
        var limit = 10,
            i;
        this.subject = subject;
        this.people = [];
        for (i = 0; i < limit; i++) {
          this.people.push({
            name: 'Friend ' + i
          });
        }
        return this.Person.create(this.people);
      })
      .then(function () {
        return this.db.edge
        .from(this.subject['@rid'])
        .to('SELECT * FROM Person WHERE name LIKE "Friend%"')
        .create('Knows');
      });
    });
    after(function () {
      return DELETE_TEST_DB('testdb_dbapi_rid_bag_embedded');
    });

    beforeEach(function () {
      return this.db.exec("select from " + this.subject['@rid'] + ' fetchPlan *:1')
      .bind(this)
      .then(function (response) {
        this.bag = response.results[0].content[0].value.out_Knows;
      });
    });

    it('should load a bag', function () {
      this.bag.should.be.an.instanceOf(LIB.Bag)
      this.bag.type.should.equal(LIB.Bag.BAG_EMBEDDED);
      expect(this.bag.uuid).to.equal(null);
      this.bag.size.should.equal(10);
    });

    it('should iterate the contents in the bag', function () {
      var size = this.bag.size,
          i = 0,
          item;
      while((item = this.bag.next())) {
        item.should.be.an.instanceOf(LIB.RID);
        i++;
      }
      i.should.equal(10);
    });

    it('should return all the contents of the bag', function () {
      var contents = this.bag.all();
      contents.length.should.equal(10);
      contents.forEach(function (item) {
        item.should.be.an.instanceOf(LIB.RID);
      });
    });

    it('should return the right JSON representation', function () {
      var json = JSON.stringify(this.bag)
          decoded = JSON.parse(json);
      decoded.length.should.equal(10);
      decoded.forEach(function (item) {
        (typeof item).should.equal('string');
      });
    });
  });

  describe('Tree Bag', function () {
    before(function () {
      this.timeout(20000);
      var self = this;
      return CREATE_TEST_DB(this, 'testdb_dbapi_rid_bag_tree', 'plocal')
      .bind(this)
      .then(function () {
        return this.db.class.create('Person', 'V');
      })
      .then(function (Person) {
        this.Person = Person;
        return this.db.class.create('Knows', 'E');
      })
      .then(function (Knows) {
        this.Knows = Knows;
        return this.Person.create({
          name: 'John Smith'
        });
      })
      .then(function (subject) {
        var limit = 120,
            i;
        this.subject = subject;
        this.people = [];
        for (i = 0; i < limit; i++) {
          this.people.push({
            name: 'Friend ' + i
          });
        }
        return this.Person.create(this.people);
      })
      .then(function () {
        return this.db.edge
        .from(this.subject['@rid'])
        .to('SELECT * FROM Person WHERE name LIKE "Friend%"')
        .create('Knows');
      });
    });
    after(function () {
      return DELETE_TEST_DB('testdb_dbapi_rid_bag_tree', '');
    });

    beforeEach(function () {
      return this.db.exec("select from " + this.subject['@rid'] + ' fetchPlan *:1')
      .bind(this)
      .then(function (response) {
        this.bag = response.results[0].content[0].value.out_Knows;
      });
    });

    it('should load a bag', function () {
      this.bag.should.be.an.instanceOf(LIB.Bag)
      this.bag.type.should.equal(LIB.Bag.BAG_TREE);
      expect(this.bag.uuid).to.equal(null);
      this.bag.size.should.equal(120);
    });
  });
});
