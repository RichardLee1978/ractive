import { capture } from '../global/capture';
import Model from './Model';
import { handleChange, mark } from '../shared/methodCallers';

export default class ComputationChild extends Model {
	constructor ( parent, key ) {
		super( parent, key );

		const parentValue = parent.get();
		if ( parentValue ) {
			this.value = parentValue[ key ];
			this.adapt();
		}

		if ( this.root.ractive.computationChildBinding ) this.isReadonly = false;
	}

	applyValue ( value ) {
		super.applyValue( value );

		// find the computation and mark the things it depends on
		let computation, parent = this.parent;
		while ( !computation && ( parent = parent.parent ) ) {
			computation = parent.computation;
		}

		if ( computation ) {
			computation.dependencies.forEach( mark );
		}
	}

	get ( shouldCapture ) {
		if ( shouldCapture ) capture( this );

		const parentValue = this.parent.get();
		return parentValue ? parentValue[ this.key ] : undefined;
	}

	handleChange () {
		this.dirty = true;

		this.deps.forEach( handleChange );
		this.children.forEach( handleChange );
		this.clearUnresolveds(); // TODO is this necessary?
	}

	joinKey ( key ) {
		if ( key === undefined || key === '' ) return this;

		if ( !this.childByKey.hasOwnProperty( key ) ) {
			const child = new ComputationChild( this, key );
			this.children.push( child );
			this.childByKey[ key ] = child;
		}

		return this.childByKey[ key ];
	}

	// TODO this causes problems with inter-component mappings
	// set () {
	// 	throw new Error( `Cannot set read-only property of computed value (${this.getKeypath()})` );
	// }
}
