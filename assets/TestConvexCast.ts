
import { _decorator, Component, Node, __private, physics } from 'cc';
import { AmmoConvexCast } from './AmmoConvexCast';
const { ccclass, property } = _decorator;

@ccclass('TestConvexCast')
export class TestConvexCast extends Component {

    start() {
        this.scheduleOnce(this.test.bind(this), 1);
    }

    test(dt: number) {

        const options: __private.cocos_physics_spec_i_physics_world_IRaycastOptions = {
            mask: physics.PhysicsGroup.DEFAULT,
            group: physics.PhysicsGroup.DEFAULT,
            queryTrigger: true,
            maxDistance: 2
        };
        AmmoConvexCast.sphereCast(2, 0, this.node.position, this.node.rotation, this.node.position, this.node.rotation, options, 1)

    }
}