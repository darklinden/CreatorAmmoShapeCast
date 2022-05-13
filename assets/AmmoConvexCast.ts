import { IQuat, IVec3, PhysicsSystem, Vec3, IVec3Like, __private } from "cc";
import { cocos2AmmoQuat, cocos2AmmoVec3 } from "./ammo-util";

// https://forum.playcanvas.com/t/playcanvas-physics-extension/13737
// https://playcanvas.com/editor/scene/940259

export namespace AmmoConvexCast {

    export enum Orientation {
        None,
        UP,
        RIGHT,
        BACK
    }

    class Cache {
        public readonly BT_V3_0: Ammo.btVector3;
        public readonly BT_V3_1: Ammo.btVector3;
        public readonly BT_V3_2: Ammo.btVector3;

        public readonly BT_TRANSFORM_0: Ammo.btTransform;
        public readonly BT_TRANSFORM_1: Ammo.btTransform;

        public readonly BT_QUAT_0: Ammo.btQuaternion;
        public readonly BT_QUAT_1: Ammo.btQuaternion;

        public readonly BT_ConvexResultCallback: Ammo.ConvexResultCallback;

        public readonly CC_V3_0: Vec3;
        public readonly CC_V3_1: Vec3;

        constructor() {
            this.BT_V3_0 = new Ammo.btVector3(0, 0, 0);
            this.BT_V3_1 = new Ammo.btVector3(0, 0, 0);
            this.BT_V3_2 = new Ammo.btVector3(0, 0, 0);

            this.BT_TRANSFORM_0 = new Ammo.btTransform();
            this.BT_TRANSFORM_1 = new Ammo.btTransform();

            this.BT_QUAT_0 = new Ammo.btQuaternion(0, 0, 0, 1);
            this.BT_QUAT_1 = new Ammo.btQuaternion(0, 0, 0, 1);

            this.CC_V3_0 = new Vec3();
            this.CC_V3_1 = new Vec3();

            this.BT_ConvexResultCallback = new Ammo.ConvexResultCallback();
        }

        // --- instance begin ---
        private static _instance: Cache = null;
        public static get i(): Cache {
            if (!this._instance) {
                const bt = window['Ammo'];
                if (bt) this._instance = new Cache();
            }
            return this._instance;
        }
        // --- instance end ---
    }

    export function physicsWorld(): Ammo.btCollisionWorld {
        return PhysicsSystem.instance.physicsWorld.impl;
    }

    /**
     * @function
     * @name RigidBodyComponentSystem#convexCast
     * @description Casts a convex shape along the linear path from startPos to endPos. Returns ConvexCastResult if 
     * there is a hit, otherewise null.
     * @param {Ammo shape} shape - Convex shape used for sweep test.
     * @param {Vec3} startPos - The world space point where the hit test starts.
     * @param {Vec3} endPos - The world space point where the test ends.
     * @param {Quat} [startRot] - Initial rotation of the shape.
     * @param {Quat} [endRot] - Final rotation of the shape.
     * @param {number} [allowedPenetration] - CCD allowance margin.
     * @returns {ConvexCastResult} object holding the hit result or null.
     */
    export function convexCast(shape: Ammo.btCollisionShape, startPos: IVec3, startRot: IQuat, endPos: IVec3, endRot: IQuat, options: __private.cocos_physics_spec_i_physics_world_IRaycastOptions, allowedPenetration: number): boolean {

        const AmmoWorld = physicsWorld();
        if (!AmmoWorld) return null;

        const from_pos = cocos2AmmoVec3(Cache.i.BT_V3_0, startPos);
        const from_rot = cocos2AmmoQuat(Cache.i.BT_QUAT_0, startRot);
        const from = Cache.i.BT_TRANSFORM_0;
        from.setOrigin(from_pos);
        from.setRotation(from_rot);

        const to_pos = cocos2AmmoVec3(Cache.i.BT_V3_1, endPos);
        const to_rot = cocos2AmmoQuat(Cache.i.BT_QUAT_1, endRot);
        const to = Cache.i.BT_TRANSFORM_1;
        to.setOrigin(to_pos);
        to.setRotation(to_rot);

        const allHitsCB = Cache.i.BT_ConvexResultCallback;
        allHitsCB.m_closestHitFraction = 0;
        allHitsCB.m_collisionFilterMask = options.mask;
        allHitsCB.m_collisionFilterGroup = options.group;

        AmmoWorld.convexSweepTest(shape, from, to, allHitsCB, allowedPenetration);
        if (allHitsCB.hasHit()) {
            console.log(allHitsCB);
            // const shapePtrs = allHitsCB.getCollisionShapePtrs();
            // const hp = allHitsCB.getHitPointWorld();
            // const hn = allHitsCB.getHitNormalWorld();
            // for (let i = 0, n = shapePtrs.size(); i < n; i++) {
            //     const shape: AmmoShape = AmmoInstance.getWrapperByPtr(shapePtrs.at(i));
            //     ammo2CocosVec3(v3_0, hp.at(i));
            //     ammo2CocosVec3(v3_1, hn.at(i));
            //     const r = pool.add();
            //     r._assign(v3_0, Vec3.distance(worldRay.o, v3_0), shape.collider, v3_1);
            //     results.push(r);
            // }
            return true;
        }
        return false;

        // this.dynamicsWorld.convexSweepTest(shape, data.ammoTransformFrom, data.ammoTransformTo, convexCallback, allowedPenetration);
        // if (convexCallback.hasHit()) {

        //     let collisionObj = convexCallback.get_m_hitCollisionObject();
        //     let body = Ammo.castObject(collisionObj, Ammo.btRigidBody);

        //     if (body) {
        //         let hitFraction = convexCallback.get_m_closestHitFraction();
        //         let point = convexCallback.get_m_hitPointWorld();
        //         let normal = convexCallback.get_m_hitNormalWorld();

        //         result = new ConvexCastResult(
        //             body.entity,
        //             hitFraction,
        //             new Vec3(point.x(), point.y(), point.z()),
        //             new Vec3(normal.x(), normal.y(), normal.z())
        //         );
        //     }
        // }

        // Ammo.destroy(shape);
        // Ammo.destroy(convexCallback);
        // return result;
    };


    //
    // Convenience methods
    //
    export function coneCast(radius: number, height: number, orientation: Orientation, startPos: IVec3, startRot: IQuat, endPos: IVec3, endRot: IQuat, options: __private.cocos_physics_spec_i_physics_world_IRaycastOptions, allowedPenetration: number): boolean {
        if (!orientation) orientation = Orientation.UP;
        let shape = _getConeShape(radius, height, orientation);
        if (!shape) throw ('Failed to generate cone shape. Check attributes.');
        return convexCast(shape, startPos, startRot, endPos, endRot, options, allowedPenetration);
    }

    export function sphereCast(radius: number, margin: number, startPos: IVec3, startRot: IQuat, endPos: IVec3, endRot: IQuat, options: __private.cocos_physics_spec_i_physics_world_IRaycastOptions, allowedPenetration: number): boolean {
        let shape = _getSphereShape(radius, margin);
        if (!shape) throw ('Failed to generate sphere shape. Check attributes.');
        return convexCast(shape, startPos, startRot, endPos, endRot, options, allowedPenetration);
    }

    export function boxCast(halfExtents: IVec3Like, margin: number, startPos: IVec3, startRot: IQuat, endPos: IVec3, endRot: IQuat, options: __private.cocos_physics_spec_i_physics_world_IRaycastOptions, allowedPenetration: number): boolean {
        let shape = _getBoxShape(halfExtents, margin);
        if (!shape) throw ('Failed to generate box shape. Check attributes.');
        return convexCast(shape, startPos, startRot, endPos, endRot, options, allowedPenetration);
    }

    export function cylinderCast(halfExtents: IVec3Like, orientation: Orientation, startPos: IVec3, startRot: IQuat, endPos: IVec3, endRot: IQuat, options: __private.cocos_physics_spec_i_physics_world_IRaycastOptions, allowedPenetration: number): boolean {
        if (!orientation) orientation = Orientation.UP;
        let shape = _getCylinderShape(halfExtents, orientation);
        if (!shape) throw ('Failed to generate cylinder shape. Check attributes.');
        return convexCast(shape, startPos, startRot, endPos, endRot, options, allowedPenetration);
    }

    export function capsuleCast(radius: number, height: number, margin: number, startPos: IVec3, startRot: IQuat, endPos: IVec3, endRot: IQuat, options: __private.cocos_physics_spec_i_physics_world_IRaycastOptions, allowedPenetration: number): boolean {
        let shape = _getCapsuleShape(radius, height, margin);
        if (!shape) throw ('Failed to generate capsule shape. Check attributes.');
        return convexCast(shape, startPos, startRot, endPos, endRot, options, allowedPenetration);
    }

    export function shapeCast(points: IVec3[], startPos: IVec3, startRot: IQuat, endPos: IVec3, endRot: IQuat, options: __private.cocos_physics_spec_i_physics_world_IRaycastOptions, allowedPenetration: number): boolean {
        let shape = _getConvexHullShape(points);
        if (!shape) throw ('Failed to generate convex hull shape. Check attributes.');
        return convexCast(shape, startPos, startRot, endPos, endRot, options, allowedPenetration);
    }

    // 
    // Helper functions
    // 
    function _getConeShape(radius: number, height: number, orientation: Orientation): Ammo.btCollisionShape {
        let shape = null;
        switch (orientation) {
            case Orientation.UP:
                shape = new Ammo.btConeShape(radius, height);
                break;

            ///btConeShape implements a Cone shape, around the X axis
            case Orientation.RIGHT:
                shape = new Ammo.btConeShapeX(radius, height);
                break;

            ///btConeShapeZ implements a Cone shape, around the Z axis
            case Orientation.BACK:
                shape = new Ammo.btConeShapeZ(radius, height);
                break;

            default:
                throw ('Invalid orientation');
        }
        return shape;
    }

    function _getSphereShape(radius: number, margin: number): Ammo.btCollisionShape {
        let sphere = new Ammo.btSphereShape(radius);
        if (margin) sphere.setMargin(margin);
        return sphere;
    }

    function _getBoxShape(halfExtents: IVec3Like, margin: number): Ammo.btCollisionShape {
        let ammoHalfExtents = Cache.i.BT_V3_2;
        ammoHalfExtents.setValue(halfExtents.x, halfExtents.y, halfExtents.z);

        let shape = new Ammo.btBoxShape(ammoHalfExtents);
        if (margin) shape.setMargin(margin);
        return shape;
    };

    function _getCylinderShape(halfExtents: IVec3Like, orientation: Orientation): Ammo.btCollisionShape {
        let shape = null;
        let ammoHalfExtents = Cache.i.BT_V3_2;
        ammoHalfExtents.setValue(halfExtents.x, halfExtents.y, halfExtents.z);

        switch (orientation) {
            case Orientation.UP:
                shape = new Ammo.btCylinderShape(ammoHalfExtents);
                break;

            ///btCylinderShapeX implements a Cone shape, around the X axis
            case Orientation.RIGHT:
                shape = new Ammo.btCylinderShapeX(ammoHalfExtents);
                break;

            ///btCylinderShapeZ implements a Cone shape, around the Z axis
            case Orientation.BACK:
                shape = new Ammo.btCylinderShapeZ(ammoHalfExtents);
                break;

            default:
                throw ('Invalid orientation');
        }
        return shape;
    }

    function _getCapsuleShape(radius: number, height: number, margin: number): Ammo.btCollisionShape {
        let shape = new Ammo.btCapsuleShape(radius, height);
        if (margin) shape.setMargin(margin);
        return shape;
    }

    function _getConvexHullShape(points: IVec3[]): Ammo.btCollisionShape {
        let shape = new Ammo.btConvexHullShape();
        points.forEach(v3 => {
            const btv3 = new Ammo.btVector3();
            shape.addPoint(cocos2AmmoVec3(btv3, v3));
        });
        return shape;
    }
}